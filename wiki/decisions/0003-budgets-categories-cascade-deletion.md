# ADR-0003: Связь бюджетов с категориями и каскадное удаление

- **Статус:** Accepted
- **Дата:** 2026-02-19
- **Контекст:** домены `budgets`, `categories`

## Контекст

Бюджет в системе всегда привязан ровно к одной категории типа `expense` (инвариант: один активный бюджет на категорию). При удалении категории возникает вопрос: что происходит с её бюджетом?

Варианты:
1. **Orphan** — оставить бюджет как есть (приведёт к «зависшему» бюджету без категории).
2. **Hard delete** — физически удалить бюджет вместе с категорией.
3. **Soft cascade** — мягко удалить бюджет при удалении категории.

## Решение

При вызове `CategoryService.deleteCategory(workspaceId, id)`:

1. Soft-delete категории — `categoriesRepo.softDelete(...)`.
2. Cleanup транзакций — `transactionsRepo.unsetCategory(...)` (по ADR-0002).
3. Soft-delete связанного бюджета — `budgetsRepo.getByCategoryId(...)` → `budgetsRepo.softDelete(...)`.

```typescript
async deleteCategory(workspaceId: string, id: string): Promise<void> {
  await this.categoriesRepo.softDelete(workspaceId, id);
  await this.transactionsRepo.unsetCategory(workspaceId, id);

  const budget = await this.budgetsRepo.getByCategoryId(workspaceId, id);
  if (budget) {
    await this.budgetsRepo.softDelete(workspaceId, budget.id);
  }
}
```

`BudgetsRepo` инжектируется в `CategoryService` через DI-контейнер.

## Обоснование

- **Не orphan:** бюджет без категории не имеет смысла — в UI он нигде не будет корректно отображаться, а его `limitMinor` войдёт в искажённый общий лимит.
- **Не hard delete:** soft delete сохраняет историческую консистентность и позволяет, при необходимости, восстановить данные или проследить аудит-трейл.
- **Soft cascade** — минимальный breaking side effect, симметричен подходу deletion semantics из ADR-0002.

## Последствия

### Плюсы
- Нет «зависших» бюджетов без категорий.
- Общий `totalLimit` всегда корректен после удаления категории.
- Данные не уничтожаются физически (soft delete).

### Минусы / компромиссы
- Операция не атомарна (три отдельных async-вызова). При частичном сбое между шагами возможен кратковременный рассинхрон.
- Нет транзакции на уровне Dexie, охватывающей все три шага одновременно.

## Связанные доменные правила

- Один активный бюджет на категорию — инвариант `BudgetsService`.
- Бюджет применяется только к категориям типа `expense` — инвариант валидации при создании.
- `unbudgetedMinor` всегда ≥ 0 — этот инвариант сохраняется, так как после удаления категории её бюджет тоже исчезает.

## Связанные ADR

- [ADR-0002: Семантика удаления категорий и влияние на транзакции](./0002-categories-deletion-semantics.md)
