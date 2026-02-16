# ADR-0001: Goals ↔ Contributions ↔ Transactions

- **Статус:** Accepted
- **Дата:** 2026-02-16
- **Контекст:** домены `goals`, `transactions`, `categories`

## Контекст

В приложении есть сценарий пополнения цели (`goal contribution`), который должен:
1. корректно отражаться в прогрессе цели,
2. быть видимым в общем потоке транзакций,
3. сохранять устойчивое поведение при частичных сбоях (offline/retry/fail-open).

Ранее логика была частично распределена по UI hooks и сервисам, что создавало риск рассинхронизации поведения.

## Решение

### 1) Связь contribution ↔ transaction

- Для contribution допускается связь `linkedTransactionId`.
- При `goalsService.contribute(...)` создаётся `transfer` transaction и contribution c `linkedTransactionId`.
- При `GoalContributionsService.updateAndRecalculate(...)` изменения contribution **пытаются** синхронизироваться в linked transaction.
- При `GoalContributionsService.deleteAndRecalculate(...)` linked transaction удаляется перед soft-delete contribution.

### 2) Source of truth для прогресса цели

- **Source of truth:** сумма активных `goalContributions.amountMinor` по `goalId`.
- `goal.currentAmountMinor` — это **кэш-поле**, пересчитываемое после мутаций contribution.
- `goal.status` вычисляется из суммы contributions и `targetAmountMinor` (с сохранением `archived` как приоритетного terminal-state).

### 3) Модель консистентности

- Для связки "contribution + linked transaction + goal cache" используется **pragmatic eventual consistency**.
- В случае частичного сбоя синхронизации linked transaction:
  - операция contribution не всегда должна падать (UX-first fail-open там, где это безопасно),
  - инцидент логируется через structured domain logger,
  - пересчёт прогресса цели выполняется в сервисном слое как post-condition.

## Последствия

### Плюсы
- Единая и документированная семантика междоменных связей.
- Меньше бизнес-логики в UI-hooks, меньше дублирования.
- Прозрачная стратегия работы с частичными сбоями.

### Минусы / компромиссы
- Нет строгой ACID-атомарности сразу для всех затронутых доменных таблиц/операций.
- Нужна дисциплина логирования и периодический контроль health метрик, чтобы fail-open не скрывал системные дефекты.

## Границы применения

ADR применим к доменам `goals`, `goalContributions`, `transactions` в рамках текущего local-first потока (Dexie + UI hooks + domain services).

## Что не покрывает

- Глобальную sync-стратегию cloud/offline для всех доменов.
- SLA/алерты production monitoring.
