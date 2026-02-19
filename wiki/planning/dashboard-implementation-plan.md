# Dashboard — Implementation Plan

Спецификация: [dashboard-feature-spec.md](./dashboard-feature-spec.md)
Статус: Draft
Последнее обновление: 2026-02-19

---

## Легенда статусов

| Статус | Смысл |
|---|---|
| [ ] | Не начато |
| `[~]` | В процессе |
| `[x]` | Готово |
| `[!]` | Заблокировано / требует решения |

---

> Файл: `src/app/(app)/app-shell.tsx`

- [ ] Добавить nav-bar / bottom-nav со ссылками на `/dashboard`, `/transactions`, `/budgets`, `/goals`, `/categories`
- [ ] Обновить `src/app/page.tsx` — добавить redirect на `/dashboard`

---

## Phase 1 — Dashboard MVP

### 1.1 Foundation: модель и типы

> Новые файлы: `src/features/dashboard/model/types.ts`

- [ ] Создать директорию `src/features/dashboard/`
- [ ] Описать типы:
  - `DashboardPeriod = "month" | "lastMonth"`
  - `DashboardFilters`
  - `DashboardSummary` DTO (totals, topCategories, goalsPreview, budgets?)
  - Вспомогательный `periodToDateRange(period, today): { from: string; to: string }`

### 1.2 Foundation: хук фильтра периода

> Новый файл: `src/features/dashboard/hooks/useDashboardFilters.ts`

- [ ] Читать `?period=month|lastMonth` из URL search params
- [ ] Fallback на `"month"` если значение невалидно
- [ ] Возвращать `{ period, setperiod, dateRange: { from, to } }`

### 1.3 Хук: Period Summary

> Новый файл: `src/features/dashboard/hooks/usePeriodSummary.ts`

- [ ] Принимать `{ workspaceId, dateRange }`
- [ ] Вызывать `TransactionsRepo.list({ dateKeyFrom, dateKeyTo })`
- [ ] Агрегировать: суммировать `amountMinor` по `type='income'` и `type='expense'`
- [ ] Исключать `type='transfer'` из суммирования
- [ ] Phase 1: агрегировать только транзакции в `defaultCurrency` (из Settings)
- [ ] Выставлять `hasMultiCurrencyTransactions: true` если есть транзакции в других валютах
- [ ] Возвращать `{ data, loading, error }`

### 1.4 Хук: Top Categories

> Новый файл: `src/features/dashboard/hooks/useTopCategories.ts`

- [ ] Принимать `{ workspaceId, dateRange, topN = 3 }`
- [ ] Загружать expense-транзакции за период через repo с `dateKeyFrom/To`
- [ ] Группировать по `categoryId`, суммировать `amountMinor`
- [ ] Join с `CategoriesRepo` — получить `name`, `colorKey`, `iconKey`
- [ ] Сортировать по убыванию расходов, брать top-N
- [ ] Обрабатывать транзакции без категории (`categoryId = null`) — группировать как "Uncategorized"
- [ ] Возвращать `{ data: TopCategoryItem[], loading, error }`

### 1.5 Хук: Goals Preview

> Новый файл: `src/features/dashboard/hooks/useGoalsPreview.ts`

- [ ] Принимать `{ topN = 3 }`
- [ ] Переиспользовать `useGoals({ status: 'active' })`
- [ ] Сортировать по `progress` (ближайшие к завершению — первые) или по `createdAt`
- [ ] Брать slice `[:topN]`
- [ ] Считать `progress = currentAmountMinor / targetAmountMinor`, clamp 0..1

### 1.6 Хук: Budgets Summary

> Новый файл: `src/features/dashboard/hooks/useBudgetsSummary.ts`

> `features/budgets` уже содержит всю необходимую агрегацию. Dashboard-хук — тонкая обёртка поверх неё.

- [ ] Принимать `{ month?: string }` (формат YYYY-MM, по умолчанию — текущий месяц)
- [ ] Переиспользовать `useBudgetSummary(month)` из `features/budgets/hooks`
- [ ] Преобразовать `TotalBudgetSummary` в `DashboardSummary.budgets` DTO:
  - `totalLimitMinor` → прямо
  - `totalSpentMinor` → прямо
  - `remainingMinor = max(0, totalLimit - totalSpent)`
  - `outsideBudgetsCount` = `categoryBudgets.filter(b => b.spentMinor > b.budget.limitMinor).length`
  - `progressUsed = totalSpentMinor / totalLimitMinor`
- [ ] Возвращать `{ data, loading, error }`

### 1.7 UI: DashboardWidgetShell

> Новый файл: `src/features/dashboard/ui/DashboardWidgetShell.tsx`

- [ ] Общая Card-обёртка для всех виджетов
- [ ] Props: `title`, `onClick`, `children`, `loading` (показывает skeleton)
- [ ] Skeleton: повторяет структуру контента виджета
- [ ] Клик по всей карточке → `onClick`, при этом внутренние кнопки не всплывают событие

### 1.8 UI: DashboardPeriodFilter

> Новый файл: `src/features/dashboard/ui/DashboardPeriodFilter.tsx`

- [ ] Segmented control / Tab с двумя опциями: "This month" / "Last month"
- [ ] Controlled через `useDashboardFilters`
- [ ] При смене — обновляет URL query param и логирует `dashboard_period_change`

### 1.9 UI: DashboardGrid

> Новый файл: `src/features/dashboard/ui/DashboardGrid.tsx`

- [ ] mobile: `flex-col`, 1 колонка
- [ ] desktop (md+): `grid grid-cols-2`, gap
- [ ] Phase 1: фиксированный порядок, никакого drag/resize

### 1.10 UI: PeriodSummaryWidget

> Новый файл: `src/features/dashboard/ui/widgets/PeriodSummaryWidget.tsx`

- [ ] Получает данные из `usePeriodSummary`
- [ ] Показывает: Income / Expense / Net с суммами
- [ ] Net: зелёный если положительный, красный если отрицательный
- [ ] Если `hasMultiCurrencyTransactions` — показывать сноску/tooltip "Showing only [currency] transactions"
- [ ] Empty state: нет транзакций → текст + CTA "Add transaction"
- [ ] onClick → `router.push('/transactions?period=<p>')`

### 1.11 UI: TopCategoriesWidget

> Новый файл: `src/features/dashboard/ui/widgets/TopCategoriesWidget.tsx`

- [ ] Получает данные из `useTopCategories`
- [ ] Рендерит список строк: иконка + цвет категории (из `features/categories`), name, сумма
- [ ] Клик на строку → `/transactions?period=<p>&type=expense&categoryId=<id>`
- [ ] Empty state: нет расходов за период
- [ ] Secondary: "See all" → `/transactions?period=<p>&type=expense`
- [ ] onClick по карточке (не строке) → `/transactions?period=<p>&type=expense`

### 1.12 UI: GoalsPreviewWidget

> Новый файл: `src/features/dashboard/ui/widgets/GoalsPreviewWidget.tsx`

- [ ] Получает данные из `useGoalsPreview`
- [ ] Рендерит `<GoalItem size="m">` из `features/goals/ui/molecules` для каждой цели
- [ ] Secondary action на каждой строке цели: "Contribute" → открывает `ContributeGoalSheet`
- [ ] Empty state: нет активных целей → "No goals yet" + CTA "Create goal"
- [ ] onClick по карточке → `/goals`

### 1.13 UI: BudgetsWidget

> Новый файл: `src/features/dashboard/ui/widgets/BudgetsWidget.tsx`

- [ ] Получает данные из `useBudgetsSummary`
- [ ] Показывает: `ProgressRing` (из `shared/ui/atoms`), spent/limit, remaining
- [ ] Если `outsideBudgetsCount > 0` — badge «N over budget»
- [ ] Если `unbudgetedMinor > 0` — показывать строку «Unbudgeted: X» (есть в `TotalBudgetSummary.unbudgetedMinor`)
- [ ] Empty state: `totalLimitMinor === 0` → «No budgets yet» + CTA к `/budgets`
- [ ] onClick → `/budgets` (route уже существует)
- [ ] Secondary: "View over budget" → `/transactions?period=<p>&scope=outsideBudgets&type=expense`

### 1.14 Page & routing

> Новые файлы: `src/app/(app)/dashboard/page.tsx`

- [ ] Создать `src/app/(app)/dashboard/page.tsx`
- [ ] Импортировать `DashboardPeriodFilter`, `DashboardGrid`, все виджеты
- [ ] Использовать `useDashboardFilters` для передачи периода в виджеты
- [ ] FAB "+" — Add Transaction (уже существует в layout, проверить что виден на /dashboard)
- [ ] Обновить `src/app/page.tsx` — добавить redirect на `/dashboard`
- [ ] Добавить `/dashboard` в навигацию app-shell (вместе с `/transactions`, `/budgets`, `/goals`, `/categories`)

### 1.15 Telemetry

- [ ] Логировать `dashboard_open` при монтировании страницы
- [ ] Логировать `dashboard_period_change` при смене фильтра
- [ ] Логировать `dashboard_widget_click` с типом виджета при клике

---

## Phase 2 — Customizable Dashboard

> Зависит от: Phase 1 полностью готова.

### 2.1 Widget Registry

- [ ] Описать `WidgetDefinition` с `type`, `title`, `minW`, `minH`, `defaultW`, `defaultH`
- [ ] Создать `WIDGET_REGISTRY: Record<DashboardWidgetType, WidgetDefinition>`
- [ ] Обновить `DashboardWidgetType`: добавить `"periodSummary" | "budgets" | "topCategories" | "goals"`

### 2.2 Layout Model & Persistence

- [ ] Описать `WidgetLayoutItem` и `DashboardLayout` типы
- [ ] Реализовать `useDashboardLayout(workspaceId)`:
  - [ ] Читать из localStorage / storage по ключу `dashboardLayout:<workspaceId>`
  - [ ] Писать при изменении
  - [ ] Валидировать при чтении (неизвестные типы виджетов — удалять)
  - [ ] Fallback на дефолтный layout если нет сохранённого
- [ ] Версионирование: `version: 1` — заложить возможность миграции

### 2.3 Layout Editor UX

- [ ] Кнопка "Customize" в top area Dashboard
- [ ] Edit-mode: виджеты получают drag handle и (на desktop) resize handle
- [ ] Кнопка "Done" — выход из edit-mode, сохранение layout
- [ ] Кнопка "Reset" — сброс на дефолтный layout
- [ ] Mobile: только reorder (move up/down кнопками или drag без resize)
- [ ] Desktop: drag + resize

### 2.4 Hide/Show Widgets

- [ ] В edit-mode: кнопка скрытия виджета
- [ ] Панель "Hidden widgets" → кнопка добавить обратно
- [ ] Скрытые виджеты сохраняются в `DashboardLayout`

### 2.5 URL Filters (Phase 2)

- [ ] Расширить `DashboardFilters`: добавить `period: "custom"`, `from`, `to`
- [ ] Добавить `DashboardPeriodFilter` — custom date range picker
- [ ] Сериализовать фильтры в URL, валидировать при чтении
- [ ] Примеры: `/dashboard?period=month`, `/dashboard?period=custom&from=2026-01-01&to=2026-01-31`

### 2.6 Telemetry (Phase 2)

- [ ] `dashboard_customize_open`
- [ ] `dashboard_layout_saved`
- [ ] `dashboard_widget_add` / `dashboard_widget_remove`

---

## Порядок разработки (рекомендуемый)

```

[ ] Phase 1.1  →  types (модель)
[ ] Phase 1.2  →  useDashboardFilters
[ ] Phase 1.7  →  DashboardWidgetShell (разблокирует UI виджетов)
[ ] Phase 1.9  →  DashboardGrid
[ ] Phase 1.14 →  page.tsx + routing (можно сделать заглушку сразу)

↓ параллельно:

[ ] Phase 1.3 + 1.10  →  PeriodSummary (хук + виджет)
[ ] Phase 1.4 + 1.11  →  TopCategories (хук + виджет)
[ ] Phase 1.5 + 1.12  →  GoalsPreview (хук + виджет)
[ ] Phase 1.6 + 1.13  →  Budgets (хук-обёртка над useBudgetSummary + виджет)

[ ] Phase 1.8   →  DashboardPeriodFilter
[ ] Phase 1.15  →  Telemetry
```
