# UI Patterns — Спецификация экранов

> **Версия:** 1.0  
> **Дата:** Февраль 2026  
> **Тип:** Low-fi спецификация

Описание структуры и поведения ключевых экранов приложения.

---

## Принципы

- без пиксель-перфекционизма
- без визуальных деталей
- **что есть на экране + как ведёт себя**
- mobile-first, desktop — расширение

---

## Оглавление

1. [Dashboard](#1-dashboard)
2. [Add Transaction](#2-add-transaction)
3. [Transactions List](#3-transactions-list)
4. [Edit Transaction](#4-edit-transaction)
5. [Goals List](#5-goals-list)
6. [Create Goal](#6-create-goal)
7. [Contribute to Goal](#7-contribute-to-goal)
8. [Categories](#8-categories)
9. [Settings](#9-settings)
10. [Глобальные состояния](#10-глобальные-состояния)

---

## 1. Dashboard

### Цель экрана

Быстро дать ответ: **«Как сейчас с деньгами и целями?»**  
И предложить **одно действие** — добавить запись.

### Структура (Mobile)

1. **Header**
   - Период (месяц по умолчанию)
   - Secondary action: смена периода (не primary)

2. **Summary card**
   - Итог расходов (Display)
   - Итог доходов (Caption)
   - Net (опционально)

3. **Goals preview**
   - 1–3 активные цели
   - Прогресс-бар
   - CTA "Пополнить"

4. **Primary CTA**
   - FAB "+" (глобальный)

### Desktop отличия

- Summary и Goals — **2 колонки**
- CTA "+ Add" в topbar

### Состояния

**Empty:**  
Текст + CTA "Добавить первую запись"

**Loading:**  
Skeleton карточек

**Error:**  
Inline message + retry (без алерта)

---

## 2. Add Transaction

**Тип:** Modal / Bottom Sheet

### Цель экрана

**Записать трату ≤ 10 секунд**.

### Структура (Mobile)

1. **Amount input** (auto-focus)
2. **Type toggle**
   - Expense / Income
3. **Category select** (опционально)
4. **Date** (по умолчанию today, скрыт под "Подробнее")
5. **Note** (collapsed by default)
6. **Primary button "Сохранить"** (sticky bottom)

### Desktop

- Dialog или Side panel
- Кнопки в footer

### Поведение

- Открытие — мгновенно
- Save → optimistic UI
- Close → ничего не сохраняем

### Ошибки

- Пустая сумма → inline под полем
- Никаких alert/confirm

---

## 3. Transactions List

### Цель экрана

Понять **что и когда тратил**, и при необходимости быстро поправить.

### Структура (Mobile)

1. **Header**
   - Заголовок
   - Secondary filters (иконка)

2. **List**
   - Группировка по дням (опционально)
   - Transaction row:
     - слева: категория / note
     - справа: сумма

3. **FAB "+"**

### Transaction Row

- **Tap** → Edit modal
- **Long press** (mobile) / **context menu** (desktop) → Delete

### Desktop

- Шире строки
- Filters как inline panel

### Состояния

**Empty:**  
"Пока нет записей" + CTA

**Loading:**  
Skeleton rows

**Error:**  
Inline retry

---

## 4. Edit Transaction

### Цель

"Уточнить позже" без боли.

### Структура

= **тот же экран, что Add Transaction**, но:

- заголовок "Редактировать"
- prefilled значения
- secondary action "Удалить" (destructive)

### Поведение

- **Save** → обновление записи
- **Delete** → confirm dialog

---

## 5. Goals List

### Цель

Видеть **к чему иду** и **как продвигаюсь**.

### Структура (Mobile)

1. **Header**
   - Заголовок

2. **Goals list**
   - Goal card:
     - name
     - progress bar
     - current / target
     - CTA "Пополнить"

3. **CTA "Добавить цель"**

### Desktop

- Карточки в 2 колонки

### Состояния

**Empty:**  
Текст + CTA

**Loading:**  
Skeleton cards

---

## 6. Create Goal

### Цель

Создать цель **без ощущения "финансовой задачи"**.

### Структура

1. **Name**
2. **Target amount**
3. **Deadline** (optional, collapsed)
4. **Primary "Создать"**

### Поведение

- После создания → Goals list
- Прогресс = 0%

---

## 7. Contribute to Goal

### Цель

Моментально увидеть прогресс.

### Структура

1. **Amount** (focus)
2. **Date** (optional)
3. **Note** (optional)
4. **Save**

### Поведение

- Save → прогресс обновляется с анимацией
- Закрытие → возврат к цели

---

## 8. Categories

### Цель

Управлять, но **не мешать core flow**.

### Структура

- List categories
- Add / Edit / Delete
- Default categories помечены

### Правила

- Удаление не ломает транзакции
- Категории **не обязательны** для записи

---

## 9. Settings

**MVP**

### Структура

- Currency
- Locale
- (позже) Export data

---

## 10. Глобальные состояния

### Empty State (шаблон)

- короткий текст
- подсказка
- CTA

### Loading

- skeleton вместо спиннеров

### Error

- inline
- без "красных экранов"

---

## См. также

- [Foundation](./foundation.md) — дизайн-система и принципы
- [Components Reference](./components.md) — документация компонентов
- [README](./README.md) — навигация по wiki/design

---

**Последнее обновление:** Февраль 2026
