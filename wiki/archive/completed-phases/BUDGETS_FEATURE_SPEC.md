💰 Budgets Feature Specification (MVP)

Version

MVP v1 — Category Budgets + Computed Overall Budget
Status: Planned

⸻

🎯 1. Цель фичи

Фича Budgets позволяет пользователю:
	•	Задать лимиты расходов по категориям
	•	Отслеживать прогресс по каждой категории
	•	Контролировать общий бюджет месяца
	•	Видеть незапланированные траты (Unbudgeted spend)

Ключевой принцип: честная и прозрачная аналитика.

⸻

📦 2. Scope MVP

Входит в MVP
	•	Бюджет на категорию (только expense)
	•	Период: monthly
	•	Общий бюджет (computed)
	•	Unbudgeted spend
	•	Прогресс 80% / 100%
	•	Over budget состояние

Не входит
	•	Годовые бюджеты
	•	Перенос остатка на следующий месяц
	•	История бюджетов по периодам
	•	Shared budgets
	•	Rolling budgets

⸻

🧠 3. Бизнес-логика

⸻

3.1 Категориальный бюджет

Бюджет создаётся для категории типа expense.

Инварианты
	•	Один активный бюджет на категорию
	•	Бюджеты применяются только к expense транзакциям
	•	Transfer и income не учитываются
	•	Spent не хранится — всегда вычисляется

⸻

3.2 Расчёт потраченного (Spent)

Для категории:

spent(category) =
  sum(transaction.amountMinor)
  where:
    transaction.type = expense
    transaction.dateKey ∈ текущий месяц
    transaction.categoryId = category.id
    transaction.deletedAt is null


⸻

3.3 Общий бюджет (Computed)

Общий бюджет не хранится в базе.

Target (лимит)

totalLimitMinor = sum(budget.limitMinor)

Только активные бюджеты категорий.

⸻

Spent

totalSpentMinor = sum(spent(category) for categories with budget)


⸻

Progress

progress = totalSpentMinor / totalLimitMinor


⸻

3.4 Unbudgeted Spend (Вариант B)

Unbudgeted — это траты, которые не покрыты бюджетами.

Включает:
	•	Expense транзакции:
	•	без categoryId
	•	с категорией без бюджета
	•	с архивированной категорией
	•	Только текущий месяц

Формула

unbudgetedMinor =
  totalExpenseThisMonth - totalSpentMinor

Важно
	•	Unbudgeted ≥ 0
	•	Unbudgeted не входит в общий бюджет
	•	Отображается отдельно

⸻

🚦 4. Поведение при достижении лимитов

Для категории
	•	80% → soft warning
	•	100% → hard warning
	•	100% → “Over budget”

Для общего бюджета

Те же пороги.

⸻

📊 5. Edge Cases

⸻

5.1 Нет ни одного бюджета

Если пользователь потратил деньги, но бюджеты не заданы:
	•	totalLimit = 0
	•	Показываем EmptyState
	•	Отображаем:
	•	Spent this month
	•	Unbudgeted = Spent

⸻

5.2 Есть бюджеты, но нет трат
	•	progress = 0%
	•	remaining = limit
	•	unbudgeted = 0

⸻

5.3 Категория удалена
	•	Бюджет soft-delete
	•	История транзакций не пересчитывается задним числом

⸻

5.4 Уменьшение лимита ниже потраченного

Если limit < spent:
	•	Состояние Over Budget
	•	Ничего автоматически не корректируется

⸻

📱 6. UX Структура страницы /budgets

⸻

6.1 Overall Budget Card

Отображает:
	•	Spent / Limit
	•	Progress
	•	Remaining
	•	Unbudgeted (если > 0)

Пример:

Total Budget
$1,250 / $2,000
[progress bar 62%]

Unbudgeted: $150
Remaining: $600


⸻

6.2 Category Budget List

Для каждой категории:

Food
$320 / $500
[progress bar]
Remaining: $180

Если over:
	•	Красный accent
	•	“Over by $40”

⸻

6.3 Categories Without Budget

Отдельный блок:

Categories without budget
• Entertainment — Spent $120
• Taxi — Spent $80

CTA: “Set budget”

⸻

🏗 7. Архитектурные принципы

⸻

НЕ храним:
	•	totalSpent
	•	totalLimit
	•	unbudgeted
	•	progress

Всегда считаем из:
	•	budgets
	•	transactions

Причина:
	•	Нет рассинхрона
	•	Нет дублирования данных
	•	Single source of truth
	•	Простота расширения

⸻

📐 8. Data Model (MVP)

export type BudgetPeriod = "monthly";

export interface Budget {
  id: string;
  workspaceId: string;

  categoryId: string;
  period: BudgetPeriod;
  currency: CurrencyCode;

  limitMinor: number;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}


⸻

📊 9. Формальные формулы

Обозначения:
	•	B = budgets
	•	T = transactions
	•	M = текущий месяц

spent(category) =
  sum(T.amountMinor)
  where T.type = expense
  and T.dateKey ∈ M
  and T.categoryId = category.id
  and T.deletedAt is null

totalSpent =
  sum(spent(category))

totalLimit =
  sum(budget.limitMinor)

unbudgeted =
  sum(expense tx in M)
  - totalSpent


⸻

🔔 10. Уведомления (будущее)

События:
	•	Category 80%
	•	Category 100%
	•	Category >100%
	•	Overall 100%

⸻

📈 11. Продуктовые метрики
	•	% пользователей с ≥1 бюджетом
	•	% пользователей с unbudgeted > 0
	•	Средний % превышения бюджета
	•	Retention после включения budget feature

⸻

🧩 12. Инварианты системы
	1.	Общий бюджет = сумма лимитов категорий.
	2.	Unbudgeted никогда не отрицателен.
	3.	Общий бюджет не включает unbudgeted.
	4.	Бюджеты применяются только к expense.
	5.	Нет отдельной сущности GlobalBudget.

⸻

🚀 13. Следующий этап реализации
	1.	Types + Repo + Dexie schema bump
	2.	budgetsService
	3.	budgetSummaryService (агрегация через transactionService)
	4.	Hooks
	5.	UI /budgets
	6.	Dashboard widget (позже)