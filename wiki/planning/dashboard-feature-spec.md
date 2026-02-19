Dashboard — Feature Specification (Canvas)

Статус: Planned
Версия: v1 (MVP Dashboard) + v2 (Customizable Dashboard)
Экран: /dashboard

⸻

0) Анализ текущей реализации (февраль 2026)

Что уже есть в коде:
- Transaction: модель реализована (`expense | income | transfer`), repo + service + hooks — рабочие
- Goal + GoalContribution: модель реализована, `currentAmountMinor` на Goal, contributions как отдельные записи
- Category: модель реализована, без поля бюджетного лимита
- Settings: `defaultCurrency`, `locale` на `workspaceId`
- App routes: `/(app)/transactions`, `/(app)/goals`, `/(app)/categories` — рабочие

Что ОТСУТСТВУЕТ и нужно для Dashboard:

| Зависимость | Статус | Комментарий |
|---|---|---|
| Роут `/dashboard` | ❌ не создан | Нужен новый page под `/(app)/dashboard/page.tsx` |
| Budget data model | ❌ не существует | `Category` не имеет `budgetLimitMinor`; нет отдельной Budget-сущности |
| Роут `/budgets` | ❌ не создан | На него ссылается Budgets Summary Widget |
| `repo.list()` date-range фильтр | ❌ отсутствует | TransactionsRepo.list принимает только `type` + `limit`; нет фильтрации по `dateKey` |
| Навигация в app-shell | ⚠️ не настроена | Dashboard не включён в nav |

Вывод: перед Phase 1 необходимо решить судьбу Budgets Widget (вынести в Phase 2 или ввести бюджет как feature), создать роут и добавить date-range query в репозиторий транзакций.

⸻

1) Цель фичи

Dashboard даёт пользователю быструю ясность по текущему периоду и мягко направляет в действия:
	•	понять «что происходит с деньгами» за выбранный период
	•	увидеть прогресс по целям и бюджетам
	•	быстро перейти к деталям (transactions / budgets / goals)

Принцип: calm + clear, без перегруза и без “финансового морализаторства”.

⸻

2) Две фазы развития

Phase 1 — Dashboard MVP (фиксированный набор виджетов)

Фокус: ценность за 1 экран, кликабельность, единый фильтр периода.
	•	фиксированная сетка (mobile: 1 колонка, desktop: 2 колонки)
	•	4–5 базовых виджетов
	•	все виджеты кликабельны → ведут в основной экран
	•	фильтр: Period (This month / Last month) + optional Custom (v1.1)

Phase 2 — Dashboard v2 (конструктор: move/resize + управление виджетами)

Фокус: персонализация без усложнения core UX.
	•	reorder (drag) + resize на desktop
	•	на mobile: упрощённый reorder (move up/down) или drag без resize
	•	добавление/скрытие виджетов
	•	сохранение layout в storage (local-first)
	•	расширенные фильтры и синхронизация с URL

⸻

3) Пользовательская ценность (Job Stories)
	•	Когда я открываю приложение, я хочу за 5–10 секунд понять итоги периода.
	•	Когда я вижу проблему (over budget / outside budgets), я хочу в один тап перейти к причинам.
	•	Когда я веду цели, я хочу видеть прогресс и быстро пополнять цель.
	•	(Phase 2) Когда я чаще смотрю одни данные, я хочу переставить и изменить размер виджетов под себя.

⸻

4) Scope

4.1 In scope — Phase 1

Виджеты (минимальный набор):
	1.	Period Summary (Income / Expense / Net)
	2.	Budgets Summary (overall progress + remaining + outside budgets, если > 0)
		⚠️ Зависимость: требует новой Budget-фичи (см. раздел 14). Варианты:
			(a) добавить `budgetLimitMinor` на Category и считать бюджеты через категории — минимальный путь
			(b) сделать отдельный Budget entity — более гибко, но дольше
			Рекомендация: вариант (a) для Phase 1, вариант (b) в backlog
	3.	Top Categories (top-3 categories by spend)
	4.	Goals Preview (1–3 активные цели + быстрый CTA)

Интерактивность (must):
	•	каждый виджет кликается целиком и ведёт на “детальный” экран
	•	внутри виджета допускается 1 secondary action (например, “See all”)

Фильтр (must):
	•	period = month | lastMonth (v1)
	•	(опционально) custom range (v1.1)

Сетка (must):
	•	mobile: вертикальный список карточек
	•	desktop: 2 колонки фиксированно (без drag/resize)

4.2 In scope — Phase 2
	•	Widget registry (тип виджета + метаданные + renderer)
	•	Layout editor:
	•	reorder (drag)
	•	resize (desktop)
	•	hide/show widgets
	•	Persist layout per workspace
	•	Shareable state via URL (filters) + local layout (не в URL)
	•	Advanced filters (см. раздел 7)

4.3 Out of scope (для обеих фаз)
	•	сложные графики (line charts, breakdown по неделям)
	•	AI советы
	•	финансовые рекомендации
	•	импорт банков

⸻

5) UX структура /dashboard

5.0 Routing & навигация
	•	Создать `src/app/(app)/dashboard/page.tsx`
	•	Добавить Dashboard в nav (app-shell) как основной экран — кандидат на стартовый роут вместо текущего boilerplate `app/page.tsx`
	•	В app-shell добавить ссылку на `/dashboard` наряду с `/transactions`, `/goals`, `/categories`

5.1 Top area
	•	Заголовок: Dashboard
	•	Контрол фильтра периода (button / select / segmented)
	•	(Phase 2) кнопка Customize → режим редактирования layout

5.2 Widget area

Все виджеты — Card style.

Принцип клика:
	•	кликом по карточке → переход в соответствующий экран
	•	secondary action внутри (если есть) не конфликтует с кликом карточки

5.3 One main action

На экране должен оставаться один главный action:
	•	FAB “+” → Add Transaction (как сейчас)

⸻

6) Виджеты (Phase 1) — контент + клики

6.1 Period Summary Widget

Показывает:
	•	Total income
	•	Total expense
	•	Net (= income − expense)

Правило агрегации:
	•	Считаются только транзакции с `type = 'income'` или `type = 'expense'`
	•	`transfer` транзакции исключаются из расчёта totals (чтобы не задваивать деньги)
	•	Мульти-валюта: если транзакции в разных валютах, агрегация ведётся в `defaultCurrency`; транзакции в других валютах исключаются (Phase 1) или конвертируются по курсу (Future). Это поведение должно быть явно отражено в UI (сноска или tooltip).

On click:
	•	/transactions?period=<p>

6.2 Budgets Summary Widget

⚠️ Зависимость: требует Budget-фичи (см. раздел 14).

Показывает:
	•	spent / limit (только по категориям с `budgetLimitMinor > 0`)
	•	progress ring/bar
	•	remaining
	•	Outside budgets count (если > 0)

Empty state:
	•	Если ни одна категория не имеет бюджета → "No budgets yet" + CTA к настройкам категорий

On click:
	•	/categories?tab=budgets (Phase 1, если бюджеты — поле категории)
		или /budgets (если будет отдельный роут — Phase 2+)

Secondary (опционально):
	•	View outside → /transactions?period=<p>&scope=outsideBudgets&type=expense

6.3 Top Categories Widget

Показывает:
	•	top-3 категории расходов за период
	•	сумма по каждой

On click:
	•	/transactions?period=<p>&type=expense (без categoryId)

Row click (на категорию):
	•	/transactions?period=<p>&type=expense&categoryId=<id>

6.4 Goals Preview Widget

Показывает:
	•	1–3 активные цели
	•	прогресс

On click:
	•	/goals

Secondary:
	•	Contribute (если уже реализовано) открывает sheet пополнения

6.5 Empty states
	•	Нет транзакций: показать empty state + CTA “Add transaction”
	•	Нет бюджетов: budgets widget показывает “No budgets yet” + CTA “Set budget”
	•	Нет целей: goals widget показывает “No goals yet” + CTA “Create goal”

⸻

7) Фильтрация

Phase 1 filters
	•	period: month | lastMonth

Phase 1.1 (дополнение — если понадобится)
	•	period = custom + from/to (YYYY-MM-DD)

Phase 2 filters (адекватная фильтрация)

Единый объект фильтра, применяемый ко всем виджетам:
	•	period: month | lastMonth | custom
	•	from/to (если custom)
	•	(опционально) type: expense | income | all (обычно all)

Требование: фильтры сериализуются в URL и валидируются при чтении.

Пример:
	•	/dashboard?period=month
	•	/dashboard?period=custom&from=2026-01-01&to=2026-01-31

⸻

8) Data & вычисления (агрегации)

8.0 Требования к репозиторию (pre-requisites для Dashboard)

`TransactionsRepo.list()` в текущей реализации принимает только `{ type, limit }`. Для Dashboard требуется:

```typescript
// Необходимо добавить:
type TransactionListOptions = {
  type?: TransactionType;
  limit?: number;
  dateKeyFrom?: string; // YYYY-MM-DD, включительно
  dateKeyTo?: string;   // YYYY-MM-DD, включительно
};
```

Это обязательно для корректной фильтрации по периоду (month / lastMonth). Без этого агрегация невозможна без загрузки всей истории транзакций.

8.1 Принципы
	•	не хранить computed totals в базе
	•	считать из transactions/budgets/goals
	•	кэшировать на уровне сервиса по (workspaceId, period)
	•	`transfer` транзакции исключаются из income/expense totals
	•	Мульти-валюта Phase 1: агрегировать только транзакции в `defaultCurrency`; остальные пропускать

8.2 DashboardSummary DTO

export type DashboardPeriod = "month" | "lastMonth" | "custom";

export type DashboardFilters = {
  period: DashboardPeriod;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export type DashboardSummary = {
  periodLabel: string;

  totals: {
    incomeMinor: number;  // только type='income', только defaultCurrency
    expenseMinor: number; // только type='expense', только defaultCurrency
    netMinor: number;     // incomeMinor - expenseMinor
    currency: string;     // defaultCurrency из Settings
    hasMultiCurrencyTransactions: boolean; // предупреждение в UI если true
  };

  budgets?: {
    totalLimitMinor: number;
    totalSpentMinor: number;
    remainingMinor: number; // max(0, limit - spent)
    outsideBudgetsMinor: number; // >= 0
    progressUsed: number; // 0..1+ (spent/limit)
  };

  topCategories: Array<{
    categoryId: string;
    name: string;
    color?: string;
    icon?: string;
    spentMinor: number;
  }>;

  goalsPreview: Array<{
    goalId: string;
    name: string;
    currentMinor: number;
    targetMinor: number;
    progress: number; // 0..1
    color?: string;
  }>;
};


⸻

9) Архитектура: где живут элементы Dashboard

9.0 Принцип

Dashboard — отдельная фича (`features/dashboard`), которая **потребляет** атомы и молекулы из существующих фич, но не загрязняет их своим контекстом.

Правило зависимостей (однонаправленные):
- `features/dashboard` → может импортировать из `features/goals`, `transactions`, `categories`
- `features/goals` / `transactions` / `categories` → **не знают** о `features/dashboard`

9.1 Структура `features/dashboard`

```
features/
  dashboard/
    model/
      types.ts              ← DashboardPeriod, DashboardFilters, DashboardSummary DTO
    hooks/
      usePeriodSummary.ts   ← агрегация из TransactionsRepo по dateKeyFrom/dateKeyTo
      useTopCategories.ts   ← агрегация расходов + join с CategoryRepo
      useGoalsPreview.ts    ← обёртка над useGoals({ status: 'active' }), берёт top-N
      useBudgetsSummary.ts  ← (когда Budget-фича появится)
      useDashboardFilters.ts ← чтение/запись period в URL search params
    ui/
      widgets/
        PeriodSummaryWidget.tsx   ← получает DashboardSummary.totals, только рендер
        GoalsPreviewWidget.tsx    ← рендерит <GoalItem> из features/goals
        TopCategoriesWidget.tsx   ← рендерит цвет/иконку из features/categories
        BudgetsWidget.tsx
      DashboardWidgetShell.tsx    ← общая Card-обёртка: title, skeleton, onClick
      DashboardPeriodFilter.tsx
      DashboardGrid.tsx           ← сетка (Phase 1: фикс. 2 колонки, Phase 2: drag/resize)
```

9.2 Что остаётся в существующих фичах

Существующие компоненты **не меняются** — Dashboard переиспользует их как есть:

| Компонент | Где живёт | Как используется в Dashboard |
|---|---|---|
| `GoalItem` | `features/goals/ui/molecules` | `GoalsPreviewWidget` рендерит его напрямую |
| `TransactionRow` | `features/transactions/ui/molecules` | Не используется в Phase 1 |
| `CategoryBadge` / иконки | `features/categories/ui` | `TopCategoriesWidget` для иконки + цвета строки |
| `ProgressRing` | `shared/ui/atoms` | Переиспользуется в `BudgetsWidget` |
| `ContributeGoalSheet` | `features/goals/ui/components` | `GoalsPreviewWidget` открывает его как secondary action |

9.3 Хуки: где агрегация, где данные

Хуки в `features/dashboard/hooks` **не дублируют** репозиторные хуки — они composed поверх них:

```
usePeriodSummary
  └─ вызывает TransactionsRepo.list({ dateKeyFrom, dateKeyTo })
  └─ агрегирует на клиенте (filter by type, sum amountMinor, exclude transfer)

useGoalsPreview
  └─ вызывает useGoals({ status: 'active' })
  └─ берёт slice [:3], считает progress

useTopCategories
  └─ вызывает TransactionsRepo.list({ type: 'expense', dateKeyFrom, dateKeyTo })
  └─ группирует по categoryId, сортирует, берёт top-3
  └─ join с categories для name/color/icon
```

9.4 Page

`app/(app)/dashboard/page.tsx` — тонкий слой: читает фильтры из URL, прокидывает в виджеты через контекст или props. Не содержит бизнес-логики.

⸻

10) Phase 2 — Конструктор Dashboard

10.1 Widget registry

type DashboardWidgetType =
  | "periodSummary"
  | "budgets"
  | "topCategories"
  | "goals";

type WidgetDefinition = {
  type: DashboardWidgetType;
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
};

10.2 Layout model (persist)

type WidgetLayoutItem = {
  id: string; // instance id
  type: DashboardWidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
};

type DashboardLayout = {
  version: 1;
  items: WidgetLayoutItem[];
};

Persist key: dashboardLayout:<workspaceId>

10.3 UX режима Customize
	•	кнопка Customize
	•	режим редактирования:
	•	drag handles
	•	resize handles (desktop)
	•	кнопка Done
	•	кнопка Reset layout
	•	на mobile: по умолчанию без resize (только reorder)

⸻

11) Loading / Error / Performance
	•	Dashboard открывается быстро (скелеты карточек)
	•	вычисления агрегаций мемоизируются/кэшируются
	•	ошибки показываются toast’ом, не ломают UI

⸻

12) Telemetry / метрики (минимально)
	•	dashboard_open
	•	dashboard_period_change
	•	dashboard_widget_click (type)
	•	(Phase 2) dashboard_customize_open, dashboard_layout_saved, dashboard_widget_add/remove

⸻

13) Definition of Done

Phase 1 DoD
	•	4 виджета отображаются корректно на mobile/desktop
	•	периодный фильтр работает и влияет на данные
	•	все виджеты кликабельны и ведут на правильные экраны
	•	empty/loading/error состояния учтены
	•	скорость: нет заметных лагов при открытии

Phase 2 DoD
	•	layout можно редактировать и сохранять
	•	после перезагрузки layout восстанавливается
	•	виджеты можно скрыть/показать
	•	resize работает на desktop
	•	URL фильтры стабильны и валидируются

⸻

14) Открытые вопросы
	•	Нужен ли custom range в Phase 1.1 или сразу в Phase 2?
	•	Какие виджеты будут первыми кандидатами на расширение (например, “Cashflow”, “Upcoming bills”)?
	•	Политика mobile layout editor: drag vs кнопки “up/down”.	•	[Новый] Budgets в Phase 1: добавить `budgetLimitMinor` на `Category` или defer Budgets Widget полностью в Phase 2?
	•	[Новый] Multi-currency: явно исключать non-default валюты в Phase 1 или блокировать агрегацию и показывать "mixed currencies" заглушку?
	•	[Новый] Стартовый экран: переключить root `/` redirect на `/dashboard` вместо текущего boilerplate?
	•	[Новый] `transfer` транзакции: только исключать из totals или показывать отдельной строкой в Period Summary?

⸻

15) Pre-requisites & зависимости реализации

Перед началом разработки Dashboard Phase 1 необходимо закрыть:

| Задача | Приоритет | Примечание |
|---|---|---|
| Добавить `dateKeyFrom` / `dateKeyTo` в `TransactionsRepo.list()` | Обязательно | Без этого нельзя фильтровать по периоду |
| Создать `/(app)/dashboard/page.tsx` | Обязательно | Роут не существует |
| Добавить Dashboard в app-shell навигацию | Обязательно | — |
| Решить судьбу Budget-фичи (поле на Category или skip) | Обязательно | Влияет на состав Phase 1 виджетов |
| Добавить `/(app)/categories?tab=budgets` или `/budgets` | Условно | Нужен только если Budgets Widget в Phase 1 |
| Redirect `/` → `/dashboard` | Желательно | UX точка входа |
