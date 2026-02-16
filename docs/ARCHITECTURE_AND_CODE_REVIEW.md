# Ревью архитектуры и кодовой базы Fluffy (scope: transactions / categories / goals)

Дата: 2026-02-16  
Контекст: повторный аудит после обновления доменной области. В этом документе рассматриваются **только** сущности, которые вы разрабатывали: `transactions`, `categories`, `goals`.

---

## 1) Что вошло в ревью

### Архитектура
- `src/features/transactions/*`
- `src/features/categories/*`
- `src/features/goals/*`
- точки интеграции между ними (связь contributions ↔ transactions, удаление categories ↔ cleanup transactions)

### Кодовая база
- сервисы домена (`model/service.ts`, `contributions.service.ts`)
- репозитории Dexie (`api/repo.dexie.ts`)
- mutation/read hooks (`hooks/*`)

### Проверки
- `npx eslint src/features/transactions src/features/categories src/features/goals --max-warnings=9999`
- `npx eslint src/app/(app)/transactions/page.tsx src/app/(app)/categories/page.tsx src/app/(app)/goals/page.tsx src/app/(app)/goals/[goalId]/page.tsx`

Обе проверки в текущем состоянии проходят без ошибок.

---

## 2) Архитектурное ревью (по выбранным фичам)

## Сильные стороны

1. **Хорошая feature-модульность**  
   Во всех 3 доменах соблюдается единый расклад `api / model / hooks / ui`, что делает изменения локальными и предсказуемыми.

2. **Явные междоменные связи на бизнес-уровне**  
   - Удаление категории корректно обнуляет `categoryId` у транзакций (без каскадного hard-delete).  
   - Goal-contribution может быть связана с `linkedTransactionId`, а при удалении contribution удаляется и связанная транзакция.

3. **Валидация в сервисном слое**  
   Ключевые инварианты (положительные суммы, валидные даты, обязательность названий) расположены в сервисах, а не только в UI.

4. **Мягкое удаление как единый паттерн**  
   Для transactions/categories/goals/contributions используется `softDelete`, что снижает риск потери данных и упрощает аудит.

## Риски и архитектурный долг

1. **Частичное дублирование orchestration-логики в hooks**  
   Логика пересчёта прогресса goals и синхронизации связанной транзакции присутствует в `useGoalContributionMutation`, хотя часть ответственности уже есть в сервисах. Это увеличивает вероятность расхождения поведения между UI-сценариями.

2. **Точечная неатомарность междоменных операций**  
   В `GoalsService.contribute` создаётся transaction, затем в отдельной транзакции Dexie пишется contribution + пересчёт goal. Есть rollback, но всё равно это не единая атомарная операция на уровне всех таблиц/доменных сервисов.

3. **Композиция зависимостей остаётся через singleton-экспорты**  
   В фичах сервисы тянутся напрямую через импорты singleton-ов, а не через централизованный composition root. Для роста проекта это усложняет тестируемость и контроль lifecycle.

---

## 3) Ревью кодовой базы (по выбранным фичам)

## Что хорошо

1. **Transactions: базовые guardrails на месте**
   - Проверка суммы при create/update.
   - Нормализация даты в update (`toDateKey` + fallback).

2. **Categories: корректная доменная семантика delete**
   - После soft-delete категории вызывается `transactionsRepo.unsetCategory(...)`.
   - При создании автоматически назначается `order`, если невалиден входной.

3. **Goals: улучшенная связность с транзакциями**
   - При `contribute` создаётся `transfer`-транзакция и сохраняется `linkedTransactionId` у contribution.
   - В delete contribution предусмотрена защита: если удаление linked transaction упало, но транзакция фактически уже удалена, удаление contribution продолжается.

## Наблюдения для улучшения

1. **Read-hook `useTransactions` смешивает чтение и seed/cleanup**  
   `useTransactions` помимо выборки делает `cleanupOldMockData` + `ensureSampleTransactionsSeeded`. Это хорошо для демо-режима, но в production-потоке лучше вынести в отдельный bootstrap/usecase.

2. **В hooks есть подавление `react-hooks/exhaustive-deps`**  
   Например, в `useTransactions` используется `filtersRef` + disable комментарии. Это рабочий компромисс, но повышает риск случайного stale-state.

3. **В mutation hooks есть “fail-open” поведение без явной телеметрии**  
   В ряде мест ошибки синхронизации (например, update linked transaction) логируются в `console.warn` и не поднимаются наверх. Это оправдано по UX, но стоит добавлять structured logging/метрики, чтобы не терять сигналы.

---

## 4) Приоритетный план улучшений (сфокусированно)

### P0
1. Вынести seed/cleanup из `useTransactions` в отдельный dev/bootstrap слой.  
2. Свести orchestration goal-contribution к одному сервисному use-case (тонкие hooks, толстые сервисы).  
3. Добавить единый structured logger для “мягко проглоченных” ошибок синхронизации.

### P1
1. Ввести composition root для `transactions/categories/goals` (инъекция зависимостей, без прямых singleton-импортов в hooks).  
2. Добавить unit-тесты на критические кейсы:
   - delete category → unset categoryId в transactions,
   - update/delete contribution → пересчёт goal.currentAmountMinor,
   - rollback-сценарий в `GoalsService.contribute`.

### P2
1. Подготовить минимальные ADR по связям domains:
   - почему contribution хранит `linkedTransactionId`,
   - где находится source of truth для прогресса goal,
   - какую консистентность считаем достаточной (strong/eventual).

---

## 5) KPI на ближайшие итерации

- 0 lint-ошибок в скоупе `transactions/categories/goals` и связанных app-страниц.
- 100% покрытие unit-тестами критичных кейсов delete/update для goal contributions.
- Отсутствие бизнес-логики seed/mock в production read-hooks.
- Все междоменные операции документированы (короткий ADR или tech note).

---

## 6) Краткий вывод

В скоупе `transactions/categories/goals` база выглядит **здоровой**: структура единообразная, сервисный слой содержит важные доменные проверки, межсущностные связи реализованы практично. Основная зона роста — **упорядочить orchestration** (меньше бизнес-логики в hooks, больше в сервисных use-case) и **формализовать наблюдаемость/тестируемость** междоменных сценариев.

- P0: выполнен ранее (refactor потоков и логирования).
- P1: выполнен частично (composition root для доменных сервисов внедрён).
- P2: добавлены ADR по доменным связям и семантике удаления категорий (`docs/adr/*`).
