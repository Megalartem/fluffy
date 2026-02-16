# Data Model

**Последнее обновление:** 16 февраля 2026

---

## Ключевая концепция: Workspace

Workspace — контейнер данных. В текущей версии он **один** и локальный. В будущем появятся user/workspaces для multi-device sync.

### `Workspace`

| Поле          | Тип            | Обяз. | Пример             | Комментарий                |
| ------------- | -------------- | ----- | ------------------ | -------------------------- |
| `id`          | string         | ✅     | `ws_local`         | фиксированный id для guest |
| `type`        | enum           | ✅     | `local` \| `cloud` | сейчас только `local`      |
| `name`        | string         | ✅     | `Local`            | на будущее                 |
| `ownerUserId` | string \| null | ➖     | `usr_...`          | появится с auth            |
| `createdAt`   | ISO datetime   | ✅     |                    |                            |
| `updatedAt`   | ISO datetime   | ✅     |                    |                            |

**Правило MVP:** всегда существует `ws_local`.

---

## Общие поля для всех сущностей

Все сущности содержат стандартный набор полей для поддержки offline-first и будущей синхронизации:

- `id` (string/uuid) - уникальный идентификатор
- `workspaceId` (string) - **обязательное уже сейчас**
- `createdAt`, `updatedAt` (ISO datetime)
- `deletedAt` (ISO datetime | null) - soft delete

_На будущее:_ `syncStatus` / `version` / `lastSyncedAt` — не нужны в MVP, но модель совместима.

---

## Сущности

### Transaction

Основная сущность для записи доходов и расходов.

| Поле         | Тип                  | Обяз. | Пример        | Правила                    |
| ------------ | -------------------- | ----- | ------------- | -------------------------- |
| `id`         | string               | ✅     | `tx_...`      | уникальный                 |
| `workspaceId`| string               | ✅     | `ws_local`    | всегда                     |
| `type`       | enum                 | ✅     | `expense` / `income` |                      |
| `amount`     | number               | ✅     | `1200.50`     | > 0                        |
| `currency`   | string               | ✅     | `VND`         | из settings при создании   |
| `date`       | ISO date             | ✅     | `2026-02-16`  | default = today            |
| `categoryId` | string \| null       | ➖     | `cat_food`    | может быть null            |
| `note`       | string \| null       | ➖     | `кофе`        |                            |
| `createdAt`  | ISO datetime         | ✅     |               |                            |
| `updatedAt`  | ISO datetime         | ✅     |               |                            |
| `deletedAt`  | ISO datetime \| null | ➖     |               |                            |

**Индексы:** 
- `workspaceId+date` - для списка по дате
- `workspaceId+type` - для фильтрации по типу
- `workspaceId+categoryId` - для фильтрации по категории

---

### Category

Категории для классификации транзакций.

| Поле         | Тип                  | Обяз. | Пример                     | Правила                    |
| ------------ | -------------------- | ----- | -------------------------- | -------------------------- |
| `id`         | string               | ✅     | `cat_food`                 |                            |
| `workspaceId`| string               | ✅     | `ws_local`                 |                            |
| `name`       | string               | ✅     | `Еда`                      |                            |
| `type`       | enum                 | ✅     | `expense`/`income`/`both`  | лучше `both`               |
| `icon`       | string \| null       | ➖     | `utensils`                 | lucide icon name           |
| `color`      | string \| null       | ➖     | `#AABBCC`                  |                            |
| `isDefault`  | boolean              | ✅     | `true`                     |                            |
| `order`      | number               | ✅     | `10`                       | для сортировки             |
| `createdAt`  | ISO datetime         | ✅     |                            |                            |
| `updatedAt`  | ISO datetime         | ✅     |                            |                            |
| `deletedAt`  | ISO datetime \| null | ➖     |                            |                            |

**Правило удаления:** при удалении категории транзакции не ломаются → `categoryId = null`.

См. [ADR-0002: Семантика удаления категорий](../decisions/0002-categories-deletion-semantics.md)

---

### Goal

Финансовые цели пользователя.

| Поле            | Тип                  | Обяз. | Пример                     | Правила                    |
| --------------- | -------------------- | ----- | -------------------------- | -------------------------- |
| `id`            | string               | ✅     | `goal_trip`                |                            |
| `workspaceId`   | string               | ✅     | `ws_local`                 |                            |
| `name`          | string               | ✅     | `Поездка`                  |                            |
| `targetAmount`  | number               | ✅     | `50000`                    | > 0                        |
| `currency`      | string               | ✅     | `VND`                      | фиксируется при создании   |
| `currentAmount` | number               | ✅     | `12000`                    | обновляется пополнениями   |
| `deadline`      | ISO date \| null     | ➖     | `2026-03-01`               | опционально                |
| `status`        | enum                 | ✅     | `active`/`completed`/`archived` | MVP: active/completed |
| `createdAt`     | ISO datetime         | ✅     |                            |                            |
| `updatedAt`     | ISO datetime         | ✅     |                            |                            |
| `deletedAt`     | ISO datetime \| null | ➖     |                            |                            |

---

### GoalContribution

Пополнения целей.

| Поле                  | Тип                  | Обяз. | Пример        |
| --------------------- | -------------------- | ----- | ------------- |
| `id`                  | string               | ✅     | `gc_...`      |
| `workspaceId`         | string               | ✅     | `ws_local`    |
| `goalId`              | string               | ✅     | `goal_trip`   |
| `amount`              | number               | ✅     | `2000`        |
| `currency`            | string               | ✅     | `VND`         |
| `date`                | ISO date             | ✅     | `2026-02-16`  |
| `note`                | string \| null       | ➖     | `отложил`     |
| `linkedTransactionId` | string \| null       | ➖     | `tx_...`      |
| `createdAt`           | ISO datetime         | ✅     |               |
| `updatedAt`           | ISO datetime         | ✅     |               |
| `deletedAt`           | ISO datetime \| null | ➖     |               |

См. [ADR-0001: Goals ↔ Contributions ↔ Transactions](../decisions/0001-goals-contributions-transactions.md)

---

### User

Пользователи системы (для будущей аутентификации).

| Поле        | Тип          | Обяз. | Пример      |
| ----------- | ------------ | ----- | ----------- |
| `id`        | string       | ✅     | `usr_...`   |
| `email`     | string       | ✅     | `a@b.com`   |
| `createdAt` | ISO datetime | ✅     |             |
| `updatedAt` | ISO datetime | ✅     |             |

**Примечание:** в local-only MVP таблица/коллекция `User` может отсутствовать физически, но контракт и миграция подготовлены.

---

### Budget

Бюджеты для контроля расходов по категориям.

| Поле         | Тип                  | Обяз. | Пример                     | Правила                    |
| ------------ | -------------------- | ----- | -------------------------- | -------------------------- |
| `id`         | string               | ✅     | `bdg_...`                  | уникальный                 |
| `workspaceId`| string               | ✅     | `ws_local`                 |                            |
| `categoryId` | string               | ✅     | `cat_food`                 | только expense категории   |
| `period`     | enum                 | ✅     | `monthly`                  | в MVP только monthly       |
| `currency`   | string               | ✅     | `VND`                      | фиксируется при создании   |
| `limitMinor` | number               | ✅     | `5000000`                  | > 0, в минорных единицах   |
| `createdAt`  | ISO datetime         | ✅     |                            |                            |
| `updatedAt`  | ISO datetime         | ✅     |                            |                            |
| `deletedAt`  | ISO datetime \| null | ➖     |                            |                            |

**Правила:**
- Один активный бюджет на категорию
- При удалении категории → бюджет soft-delete
- Потраченная сумма (spent) не хранится — всегда вычисляется из транзакций
- Общий бюджет = сумма лимитов категорий (не хранится отдельно)

**Индексы:** 
- `workspaceId+categoryId` - для быстрого поиска бюджета категории
- `workspaceId+deletedAt` - для фильтрации активных бюджетов

**См. также:** [Budgets Feature Spec](../planning/BUDGETS_FEATURE_SPEC.md)

---

### AppSettings

Настройки приложения (привязаны к workspace).

| Поле              | Тип          | Обяз. | Пример              |
| ----------------- | ------------ | ----- | ------------------- |
| `id`              | string       | ✅     | `settings_ws_local` |
| `workspaceId`     | string       | ✅     | `ws_local`          |
| `defaultCurrency` | string       | ✅     | `VND`               |
| `locale`          | string       | ✅     | `ru-RU`             |
| `createdAt`       | ISO datetime | ✅     |                     |
| `updatedAt`       | ISO datetime | ✅     |                     |

---

## Доменные правила

### Режим Guest (Local)

- `workspaceId = ws_local`
- все данные хранятся в IndexedDB
- экспорт/импорт доступен для резервного копирования

### Режим Account (Cloud) - будущее

- после логина создаётся `workspaceId = ws_cloud_<userId>`
- данные синхронизируются с Firebase/облаком
- `ws_local` можно:
  - объединить с cloud workspace
  - оставить отдельным

---

## Схема миграций

Для поддержки эволюции схемы БД используется версионирование:

- `meta.schemaVersion = 1` (в IndexedDB metadata)
- При изменениях — миграции через Dexie
- Backward compatibility для облачной синхронизации

---

## Смотрите также

- [Architecture](../development/architecture.md) - архитектура хранения данных
- [Offline-First Patterns](../development/offline-first.md) - паттерны работы с данными
- [ADR-0001: Goals ↔ Contributions ↔ Transactions](../decisions/0001-goals-contributions-transactions.md)
- [ADR-0002: Семантика удаления категорий](../decisions/0002-categories-deletion-semantics.md)
