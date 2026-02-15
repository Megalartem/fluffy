# Sprint Tasks - Feature Improvements

**Created:** February 14, 2026  
**Sprint Focus:** Polish & UX Enhancement  
**Based on:** Goals (93%), Categories (95%), Transactions (92%) Feature Reviews

---

## 🎯 Sprint Goal

Улучшить UX основных фич через добавление недостающих интерактивных элементов и полей. Довести все три фичи до 95%+ готовности.

---

## 🔥 High Priority (Sprint 1 - Must Have)

### Task 1.1: ActionMenu для Categories (Long Press) ⭐⭐⭐

**Status:** Rejected
**Priority:** P0 (High)  
**Estimate:** 2 hours  
**Feature:** Categories  
**Impact:** Consistency с Goals UI pattern
**Reason** У категорий уже есть понятный флоу открытия этого окна. дополнительный longpress будет избыточен

**Description:**
Добавить ActionMenu по долгому нажатию для CategoryRow, аналогично GoalItem.

**Current State:**
- ✅ ActionMenu существует, но показывается всегда как trailing content
- ❌ Нет long press support
- ❌ Inconsistent с GoalItem UX (где menu по long press)

**Implementation:**
1. **CategoryRow.tsx:**
   - Add `onLongPress` prop
   - Add `isActionsMenuOpen` state
   - Hide ActionMenu визуально (triggerClassName с width: 1px)
   - Show menu programmatically через isOpen prop

2. **Pattern:** Использовать тот же паттерн что в GoalItem:
```tsx
const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

<ListRowBase
  // ...
  onLongPress={() => setIsActionsMenuOpen(true)}
  trailing={
    <ActionMenu
      isOpen={isActionsMenuOpen}
      onOpenChange={setIsActionsMenuOpen}
      triggerClassName={styles.hiddenTrigger}
      // ...
    />
  }
/>
```

**CSS:**
```css
.hiddenTrigger {
  width: 1px;
  height: 1px;
  padding: 0;
}
```

**Files to Change:**
- `src/features/categories/ui/molecules/CategoryRow/CategoryRow.tsx`
- `src/features/categories/ui/molecules/CategoryRow/CategoryRow.module.css`

**Acceptance Criteria:**
- [ ] Long press на CategoryRow открывает ActionMenu
- [ ] Menu содержит: Edit, Archive/Unarchive, Delete
- [ ] Визуально menu не виден как trailing element (скрытый trigger)
- [ ] Works на desktop (click на hidden element) и mobile (long press)
- [ ] Consistent behavior с GoalItem

---

### Task 1.2: ActionMenu для Transactions (Long Press + Delete) ⭐⭐⭐

**Status:** 🆕 Completed 
**Priority:** P0 (High)  
**Estimate:** 3 hours  
**Feature:** Transactions  
**Impact:** Critical - нет способа удалить транзакцию в UI

**Description:**
Добавить ActionMenu по долгому нажатию для TransactionRow с возможностью Edit и Delete.

**Current State:**
- ❌ TransactionRow не имеет actions menu
- ❌ onClick открывает edit, но нет способа удалить
- ✅ `txDelete()` реализован в hooks
- ❌ Нет ConfirmDialog для удаления

**Implementation:**
1. **TransactionRow.tsx:**
   - Add ActionMenu component
   - Add `onEdit` и `onDelete` props
   - Long press support
   - Hidden trigger pattern

2. **Actions:**
   - **Edit** - текущий onClick
   - **Delete** - новый action (danger variant)

3. **page.tsx:**
   - Add ConfirmDialog state
   - Add delete handler:
```tsx
const [deletingTransaction, setDeletingTransaction] = useState<Transaction>();

const handleDelete = (tx: Transaction) => {
  setDeletingTransaction(tx);
};

const confirmDelete = async () => {
  if (!deletingTransaction) return;
  await txDelete(deletingTransaction.id);
  setDeletingTransaction(undefined);
  refresh();
};
```

4. **ConfirmDialog:**
```tsx
<ConfirmDialog
  open={deletingTransaction !== undefined}
  title="Delete transaction?"
  description="This action cannot be undone"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  tone="danger"
  onConfirm={confirmDelete}
  onCancel={() => setDeletingTransaction(undefined)}
/>
```

**Files to Change:**
- `src/features/transactions/ui/molecules/TransactionRow/TransactionRow.tsx`
- `src/features/transactions/ui/molecules/TransactionRow/TransactionRow.module.css`
- `src/app/(app)/transactions/page.tsx`

**Dependencies:**
- Ensure ConfirmDialog component exists in shared/ui

**Acceptance Criteria:**
- [x] Long press на TransactionRow открывает ActionMenu
- [x] Menu содержит: Edit, Delete
- [x] Delete показывает ConfirmDialog
- [x] После подтверждения транзакция удаляется
- [x] Day totals пересчитываются после удаления
- [x] Empty state появляется если удалена последняя транзакция
- [x] Works на desktop и mobile

---

### Task 1.3: Note Field для Transactions ⭐⭐

**Status:** 🆕 Done  
**Priority:** P1 (High-Medium)  
**Estimate:** 2 hours  
**Feature:** Transactions  
**Impact:** Medium - улучшает контекст транзакций

**Description:**
Добавить поле note в TransactionUpsertSheet и отображение в TransactionRow.

**Current State:**
- ✅ Поле `note` есть в Transaction model
- ✅ Сохраняется в БД
- ❌ Нет поля в TransactionUpsertSheet form
- ❌ Не отображается в TransactionRow

**Implementation:**
1. **TransactionUpsertSheet.tsx:**
   - Add `note` to FormValues type
   - Add FormFieldString component:
```tsx
<FormFieldString<FormValues>
  name="note"
  label="Note (optional)"
  placeholder="Add description..."
  multiline
  rows={2}
/>
```

2. **TransactionRow.tsx:**
   - Add subtitle support with note
   - Show note if exists (truncate для длинных)
```tsx
subtitle={
  transaction.note ? (
    <Text variant="caption" className={styles.note}>
      {transaction.note}
    </Text>
  ) : undefined
}
```

3. **CSS для note:**
```css
.note {
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

4. **Search extension (optional):**
```typescript
// In hooks/utils/transactions.ts
if (query) {
  const lowerQuery = query.toLowerCase();
  const categoryName = categoryNameById[tx.categoryId ?? ""] ?? "";
  const matchesCategory = categoryName.toLowerCase().includes(lowerQuery);
  const matchesNote = tx.note?.toLowerCase().includes(lowerQuery) ?? false;
  
  if (!matchesCategory && !matchesNote) {
    return false;
  }
}
```

**Files to Change:**
- `src/features/transactions/ui/components/TransactionUpsertSheet/TransactionUpsertSheet.tsx`
- `src/features/transactions/ui/molecules/TransactionRow/TransactionRow.tsx`
- `src/features/transactions/ui/molecules/TransactionRow/TransactionRow.module.css`
- `src/features/transactions/hooks/utils/transactions.ts` (optional - search)

**Acceptance Criteria:**
- [x] Note field присутствует в create/edit форме
- [x] Note опционально (не required)
- [x] Multiline support (2 rows)
- [x] Note отображается в TransactionRow как subtitle
- [x] Если note пустая - subtitle не показывается
- [x] Long note truncates с ellipsis (2 lines max)
- [x] `white-space: pre-line` для поддержки переносов
- [x] (Optional) Search работает по note

---

## 🔸 Medium Priority (Sprint 2 - Should Have)

### Task 2.1: Color Picker для Goals ⭐

**Status:** 🆕 Done  
**Priority:** P2 (Medium)  
**Estimate:** 3 hours  
**Feature:** Goals  
**Impact:** Low-Medium - персонализация целей

**Description:**
Реализовать color picker в GoalUpsertSheet и применение цвета к ProgressRing.

**Current State:**
- ✅ Поле `colorKey` объявлено в Goal model
- ❌ Нет UI для выбора цвета
- ❌ Цвет не применяется к ProgressRing

**Implementation:**
1. **Reuse CategoryAppearanceField pattern:**
   - Берем ColorBezelCarousel из categories
   - Создаем GoalColorField component

2. **GoalUpsertSheet.tsx:**
   - Add `colorKey` to FormValues
   - Add FormFieldGoalColor:
```tsx
<FormFieldGoalColor
  name="colorKey"
  label="Color (optional)"
  colors={GOAL_COLORS} // from constants
/>
```

3. **GoalItem.tsx:**
   - Pass colorKey to ProgressRing (if supported)
   - Or: apply CSS custom property

4. **ProgressRing.tsx (if needed):**
   - Add color prop support
   - Map color to CSS variable

**Constants:**
```typescript
// src/features/goals/constants/colors.ts
export const GOAL_COLORS = [
  "blue", "green", "red", "purple", "orange",
  "yellow", "pink", "teal", "indigo", "gray"
] as const;

export type GoalColor = typeof GOAL_COLORS[number];
```

**Files to Change:**
- `src/features/goals/ui/components/GoalUpsertSheet/GoalUpsertSheet.tsx`
- `src/features/goals/ui/molecules/GoalItem/GoalItem.tsx`
- `src/features/goals/constants/colors.ts` (new)
- `src/shared/ui/atoms/ProgressRing/ProgressRing.tsx` (optional)

**Alternative:**
- Если ProgressRing не поддерживает кастомные цвета - просто сохраняем colorKey для будущего использования

**Acceptance Criteria:**
- [x] Color picker присутствует в GoalUpsertSheet
- [x] Поддерживает 10+ цветов
- [x] BezelCarousel UI pattern (reuse from categories)
- [x] colorKey сохраняется в БД
- [x] (Optional) Цвет применяется к ProgressRing
- [x] (Optional) Null colorKey = default color

---

### Task 2.2: Drag & Drop Reordering для Categories ⭐

**Status:** 🆕 Done ✅  
**Priority:** P2 (Medium)  
**Estimate:** 4 hours  
**Feature:** Categories  
**Impact:** Medium - улучшает управление порядком

**Description:**
Добавить drag & drop для изменения порядка категорий.

**Current State:**
- ✅ Поле `order` работает
- ✅ Сортировка по order в repo
- ✅ Можно изменить order через drag & drop UI

**Implementation:**
1. **Library:** Install `@dnd-kit/core` + `@dnd-kit/sortable`

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

2. **CategoryList.tsx:**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
    {categories.map(category => (
      <SortableCategoryRow key={category.id} category={category} />
    ))}
  </SortableContext>
</DndContext>
```

3. **SortableCategoryRow wrapper:**
```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableCategoryRow({ category, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: category.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AnimatedCategoryItem
        category={category}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props}
      />
    </div>
  );
}
```

4. **Reorder logic:**
```tsx
const handleDragEnd = (event) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = categories.findIndex(c => c.id === active.id);
  const newIndex = categories.findIndex(c => c.id === over.id);

  // Optimistic update
  const reordered = arrayMove(categories, oldIndex, newIndex);
  
  // Save new order
  await Promise.all(
    reordered.map((cat, index) => 
      catUpdate(cat.id, { order: index })
    )
  );
};
```

**Files to Change:**
- `src/features/categories/ui/components/CategoryList/CategoryList.tsx`
- `src/features/categories/ui/molecules/CategoryRow/SortableCategoryRow.tsx` (new)
- `package.json` (add dependencies)

**Acceptance Criteria:**
- [x] Long press → drag mode активируется
- [x] Visual feedback (elevation, opacity) при drag
- [x] Drop между элементами
- [x] Order пересчитывается и сохраняется
- [x] Optimistic UI update (instant feedback)
- [x] Works на desktop (mouse drag) и mobile (touch drag)
- [x] Animation smooth (не прыгает)

---

### Task 2.3: Pagination (Load More) для Transactions ⭐

**Status:** 🆕 NEW  
**Priority:** P2 (Medium)  
**Estimate:** 2 hours  
**Feature:** Transactions  
**Impact:** Medium - performance для больших datasets

**Description:**
Добавить "Load More" кнопку для постепенной загрузки транзакций.

**Current State:**
- ✅ Repo поддерживает `limit` parameter
- ✅ Hook имеет `initialLimit` и `step` props
- ❌ UI всегда показывает все (до limit)
- ❌ Limit фиксирован на 50

**Implementation:**
1. **useTransactions.ts:**
   - Expose `limit` state
   - Add `loadMore()` function
```tsx
const [limit, setLimit] = useState(initialLimit);

const loadMore = useCallback(() => {
  setLimit(prev => prev + step);
}, [step]);

return { transactions, loading, error, refresh, loadMore, hasMore };
```

2. **TransactionsList.tsx:**
   - Add "Load More" button at bottom
   - Show loading state
   - Hide button если все загружено
```tsx
{hasMore && !loading && (
  <div className={styles.loadMoreContainer}>
    <Button onClick={onLoadMore} variant="secondary">
      Load More
    </Button>
  </div>
)}
```

3. **Check hasMore:**
```tsx
const hasMore = transactions.length >= limit;
```

**Files to Change:**
- `src/features/transactions/hooks/useTransactions.ts`
- `src/features/transactions/ui/components/TransactionsList/TransactionsList.tsx`
- `src/app/(app)/transactions/page.tsx`

**Alternative - Infinite Scroll:**
```tsx
// Using Intersection Observer
const observerTarget = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    { threshold: 1 }
  );

  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }

  return () => observer.disconnect();
}, [hasMore, loading, loadMore]);

<div ref={observerTarget} className={styles.observer} />
```

**Acceptance Criteria:**
- [ ] Transactions загружаются постепенно (50 по умолчанию)
- [ ] "Load More" button внизу списка
- [ ] Button скрывается когда все загружено
- [ ] Loading indicator при загрузке следующей порции
- [ ] Works с фильтрами и сортировкой
- [ ] (Alternative) Infinite scroll работает
- [ ] Performance: no re-renders всего списка

---

## 🔹 Low Priority (Backlog - Nice to Have)

### Task 3.1: Type "both" для Categories

**Priority:** P3 (Low)  
**Estimate:** 2 hours  
**Feature:** Categories  

**Description:**
Добавить поддержку типа "both" для универсальных категорий.

**Changes:**
- Add "Both" option в CategoryUpsertSheet segment control
- Update CategoryList groupByType logic
- Update transaction filters для "both" categories

---

### Task 3.2: Transfer Type Full Support

**Priority:** P3 (Low)  
**Estimate:** 8+ hours  
**Feature:** Transactions  
**Blocked by:** Accounts feature (not implemented)

**Description:**
Полноценная поддержка transfer транзакций требует:
- Accounts feature (from/to accounts)
- Transfer UI flow
- Transfer display с обоими счетами

---

### Task 3.3: Bulk Operations для Transactions

**Priority:** P3 (Low)  
**Estimate:** 6 hours  
**Feature:** Transactions  

**Description:**
- Selection mode (checkboxes)
- Bulk delete
- Bulk change category
- Actions bar

---

### Task 3.4: Export/Import для Transactions

**Priority:** P3 (Low)  
**Estimate:** 6 hours  
**Feature:** Transactions  

**Description:**
- Export to CSV/Excel/JSON
- Import from CSV
- Date range selection
- Validation

---

### Task 3.5: Currency Context Refactoring (Goals)

**Priority:** P3 (Low)  
**Estimate:** 2 hours  
**Feature:** Goals  

**Description:**
Move currency из useWorkspace hook в form context или props для лучшей decoupling.

---

## 📊 Sprint Summary

### Sprint 1 (High Priority)
| Task | Estimate | Feature | Impact |
|------|----------|---------|--------|
| 1.1 ActionMenu для Categories | 2h | Categories | High |
| 1.2 ActionMenu + Delete для Transactions | 3h | Transactions | High |
| 1.3 Note field для Transactions | 2h | Transactions | Medium |
| **Total** | **7h** | | |

### Sprint 2 (Medium Priority)
| Task | Estimate | Feature | Impact |
|------|----------|---------|--------|
| 2.1 Color Picker для Goals | 3h | Goals | Medium |
| 2.2 Drag & Drop для Categories | 4h | Categories | Medium |
| 2.3 Pagination для Transactions | 2h | Transactions | Medium |
| **Total** | **9h** | | |

### Total Backlog
| Task | Estimate | Priority |
|------|----------|----------|
| 3.1 Type "both" | 2h | Low |
| 3.2 Transfer Support | 8h+ | Low |
| 3.3 Bulk Operations | 6h | Low |
| 3.4 Export/Import | 6h | Low |
| 3.5 Currency Refactoring | 2h | Low |
| **Total** | **24h** | |

---

## 🎯 Recommended Sprint Plan

**Sprint 1 (1 week):**
- Focus: Consistency & Critical UX
- Tasks: 1.1, 1.2, 1.3
- Result: Все фичи с ActionMenu + Delete + Note
- Completeness: Goals 95%, Categories 96%, Transactions 94%

**Sprint 2 (1 week):**
- Focus: Polish & Enhancement
- Tasks: 2.1, 2.2, 2.3
- Result: Персонализация + Reordering + Performance
- Completeness: Goals 97%, Categories 98%, Transactions 96%

**Future:**
- Backlog tasks по необходимости
- Based on user feedback

---

## ✅ Acceptance Criteria (Overall)

**Sprint 1 Done When:**
- [ ] All three features have consistent ActionMenu UX (long press)
- [ ] Transactions можно удалять через UI
- [ ] Transactions имеют note field для контекста
- [ ] No critical UX gaps
- [ ] All tests pass (when written)

**Sprint 2 Done When:**
- [ ] Goals персонализируются через цвета
- [ ] Categories можно переупорядочить drag & drop
- [ ] Transactions загружаются постепенно (performance)
- [ ] All features at 95%+ completeness
- [ ] User feedback incorporated

---

**Last Updated:** February 14, 2026  
**Prepared by:** Technical Review  
**Status:** Ready for Sprint Planning
