# 💰 Budgets Feature — Implementation Tracker

**Feature:** Budgets MVP (Category Budgets + Computed Overall Budget)  
**Specification:** [BUDGETS_FEATURE_SPEC.md](./BUDGETS_FEATURE_SPEC.md)  
**Status:** � In Progress  
**Start Date:** February 16, 2026  
**Target Completion:** TBD  

---

## 📊 Progress Overview

| Phase | Status | Time Est. | Time Actual | Completion |
|-------|--------|-----------|-------------|------------|
| **Phase 1: Data Layer** | ✅ Complete | 4-5h | ~4h | 100% |
| **Phase 2: Business Logic** | ✅ Complete | 5-6h | ~3h | 100% |
| **Phase 3: React Integration** | ✅ Complete | 4-5h | ~2h | 100% |
| **Phase 4: UI Components** | 🟡 In Progress | 6-8h | ~6h | ~90% |
| **Phase 5: Integration & Polish** | ⬜ Not Started | 2-3h | — | 0% |
| **Total** | — | **21-27h** | **~16h** | **~88%** |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ⏸️ Blocked

---

## 🎯 Phase 1: Data Layer (4-5 hours) ✅

### Task 1.1: Data Model & Types ✅
**Time:** 1 hour | **Status:** Complete | **Actual:** ~30min

**Files created:**
- ✅ `src/features/budgets/model/types.ts`

**Checklist:**
- ✅ Define `BudgetPeriod` type
- ✅ Define `Budget` interface with all required fields
- ✅ Define `CreateBudgetInput` type
- ✅ Define `UpdateBudgetPatch` and `UpdateBudgetInput` types
- ✅ Define `CategoryBudgetSummary` interface
- ✅ Define `TotalBudgetSummary` interface
- ⬜ Export all types from `model/index.ts` (can be done later)

**Acceptance Criteria:**
- ✅ All types follow project conventions (workspaceId, timestamps, soft delete)
- ✅ Types are compatible with existing Transaction and Category types
- ✅ Currency uses `CurrencyCode` from shared types
- ✅ Amount fields use `Minor` suffix (e.g., `limitMinor`)

**Notes:**
```typescript
// Key types structure:
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
```

---

### Task 1.2: Dexie Schema Migration ⬜
### Task 1.2: Dexie Schema Migration ✅
**Time:** 1 hour | **Status:** Complete | **Actual:** ~1.5h

**Files modified:**
- ✅ `src/shared/lib/storage/db.ts` (updated BudgetDB class)
- ✅ `src/core/db/config.ts` (updated Budget interface for reference)

**Checklist:**
- ✅ Update `Budget` interface to use `limitMinor` and ISO string timestamps
- ✅ Bump Dexie version to 9 (in BudgetDB)
- ✅ Add compound index: `[workspaceId+categoryId]`
- ✅ Add index: `workspaceId`, `period`, `updatedAt`, `deletedAt`
- ✅ Migration handles legacy data (clears old monthly budgets if incompatible)
- ✅ Test migration in development mode
- ✅ Verify existing data is preserved

**Acceptance Criteria:**
- ✅ Schema migration runs without errors
- ✅ Existing data (transactions, categories, goals) is intact
- ✅ New budgets table is accessible via Dexie
- ✅ Compound index provides fast lookups by workspace + category

**Actual Schema:**
```typescript
budgets:
  "&id, workspaceId, categoryId, period, updatedAt, deletedAt, [workspaceId+categoryId], [workspaceId+period], [workspaceId+updatedAt]"
```

**Notes:**
- Used actual production DB file: `/shared/lib/storage/db.ts` (BudgetDB), not the reference file in `/core/db/config.ts`
- Migration clears old incompatible monthly budgets to start fresh with category-based budgets

---

### Task 1.3: Repository Interface ✅
**Time:** 30 minutes | **Status:** Complete | **Actual:** ~10min

**Files created:**
- ✅ `src/features/budgets/api/repo.ts`

**Checklist:**
- ✅ Define `BudgetsRepo` interface
- ✅ Add `list(workspaceId)` method
- ✅ Add `getById(workspaceId, id)` method
- ✅ Add `getByCategoryId(workspaceId, categoryId)` method
- ✅ Add `create(workspaceId, budget)` method
- ✅ Add `update(workspaceId, id, patch)` method
- ✅ Add `softDelete(workspaceId, id)` method
- ⬜ Document each method with JSDoc (can be added later)

**Acceptance Criteria:**
- ✅ Interface follows same pattern as TransactionsRepo and CategoriesRepo
- ✅ All methods return Promises
- ✅ Proper TypeScript types for all parameters and return values

**Notes:**
- Interface created by user, reviewed and verified

---

### Task 1.4: Dexie Repository Implementation ✅
**Time:** 1.5 hours | **Status:** Complete | **Actual:** ~1.5h

**Files created:**
- ✅ `src/features/budgets/api/repo.dexie.ts`

**Checklist:**
- ✅ Implement `list()` with `deletedAt === null` filter
- ✅ Implement `getById()` with null check
- ✅ Implement `getByCategoryId()` for unique category budget
- ✅ Implement `create()` with duplicate check (unique categoryId constraint)
- ✅ Implement `update()` with existence check
- ✅ Implement `softDelete()` setting deletedAt timestamp
- ✅ Add proper error handling (try-catch with AppError)
- ✅ Export singleton instance `budgetsRepo`
- ⬜ Test all methods manually (pending)

**Acceptance Criteria:**
- ✅ All CRUD operations implemented correctly
- ✅ Soft delete preserves data but filters it from queries
- ✅ Creating duplicate budget for same category throws DUPLICATE_BUDGET error
- ✅ Error messages are clear and actionable (using AppError)

**Key Implementation:**
- Uses compound index `[workspaceId+categoryId]` for fast category budget lookup
- Follows project patterns (ensureDbInitialized, nowIso, AppError)
- Singleton pattern: exports `budgetsRepo` instance

---

## 🧠 Phase 2: Business Logic Layer (5-6 hours) ✅

### Task 2.1: Budgets Service ✅
**Time:** 2 hours | **Status:** Complete | **Actual:** ~1.5h

**Files created:**
- ✅ `src/features/budgets/model/service.ts`

**Checklist:**
- ✅ Create `BudgetsService` class
- ✅ Implement `create(input)` with validation
- ✅ Implement `update(input)` with validation
- ✅ Implement `delete(id)` method
- ✅ Implement `getById(id)` method
- ✅ Implement `getByCategoryId(categoryId)` method
- ✅ Implement `list()` method
- ✅ Add validation: category must be type="expense"
- ✅ Add validation: limitMinor > 0
- ✅ Add validation: only one active budget per category
- ✅ Add validation: category must exist
- ⬜ Integrate with DI container (pending Phase 3)
- ⬜ Add unit tests (optional, can be done later)

**Acceptance Criteria:**
- ✅ All validations throw proper errors with codes
- ✅ Service uses workspace context correctly
- ✅ Timestamps (createdAt, updatedAt) are set automatically
- ✅ Service integrates with CategoriesRepo for validation

**Notes:**
- Extracted `makeId` function to shared utility: `src/shared/lib/id.ts`
- Updated all services and seed files to use shared `makeId`

---

### Task 2.2: Budget Summary Service ✅
**Time:** 3 hours | **Status:** Complete | **Actual:** ~1h

**Files created:**
- ✅ `src/features/budgets/model/summary-service.ts`

**Checklist:**
- ✅ Create `BudgetSummaryService` class
- ✅ Implement `getCategorySpent(categoryId, month)` - sum expenses
- ✅ Implement `getCategoryBudgetSummary(categoryId)` - per-category summary
- ✅ Implement `getTotalBudgetSummary(month?)` - overall summary
- ✅ Implement `getCategoriesWithoutBudget()` - categories with spending but no budget
- ✅ Calculate totalSpent from transactions
- ✅ Calculate totalLimit from budgets
- ✅ Calculate unbudgeted (total expense - budgeted expense)
- ✅ Calculate progress (spent / limit)
- ✅ Determine isOverBudget (spent > limit)
- ✅ Determine isWarning (spent >= limit * 0.8)
- ✅ Handle edge case: no budgets exist
- ✅ Handle edge case: no transactions exist
- ⬜ Integrate with DI container (pending Phase 3)
- ⬜ Add unit tests for calculation logic (optional)

**Acceptance Criteria:**
- ✅ Formulas match specification exactly
- ✅ Only expense transactions are counted
- ✅ Only current month transactions are counted (default)
- ✅ Unbudgeted amount is always >= 0
- ✅ Progress percentage is accurate (0-100+%)
- ✅ Service correctly aggregates data from budgets and transactions

**Key Implementation:**
- Helper function `getMonthRange()` converts YYYY-MM to date range
- Helper function `getCurrentMonth()` returns current month in YYYY-MM format
- Uses `TransactionsRepo.list()` with filters for efficient queries
- Sorts unbudgeted categories by spending descending

---

### Task 2.3: Validators ✅
**Time:** 1 hour | **Status:** Complete | **Actual:** ~30min

**Files created:**
- ✅ `src/features/budgets/model/validators.ts`

**Checklist:**
- ✅ Create `validateBudgetInput(input)` function
- ✅ Check limitMinor > 0
- ✅ Check limitMinor <= MAX_LIMIT (999,999,999,999)
- ✅ Check categoryId is valid (non-empty string)
- ✅ Check period is valid BudgetPeriod value ("monthly")
- ✅ Check currency is provided
- ✅ Define error codes: VALIDATION_ERROR with descriptive messages
- ✅ Create `validateBudgetPatch()` for update validation
- ✅ Export validation constants (MAX_BUDGET_LIMIT, MIN_BUDGET_LIMIT)

**Acceptance Criteria:**
- ✅ Validators throw clear, actionable errors with AppError
- ✅ Error messages are user-friendly
- ✅ Validation happens before database operations (in service)
- ✅ Constants defined for reuse (MAX/MIN limits)

**Notes:**
- MAX_BUDGET_LIMIT set to 999,999,999,999 (trillion minor units)
- MIN_BUDGET_LIMIT set to 1 minor unit
- Validators used in BudgetsService.create() and update()

---

### Phase 2 Summary ✅

**Total Time:** ~3 hours (faster than estimated 5-6h)

**Created Files:**
- ✅ `src/shared/lib/id.ts` (shared utility)
- ✅ `src/features/budgets/model/service.ts`
- ✅ `src/features/budgets/model/summary-service.ts`
- ✅ `src/features/budgets/model/validators.ts`
- ✅ `src/features/budgets/model/index.ts`

**Refactoring:**
- ✅ Extracted `makeId` to shared utility
- ✅ Updated 5 files to use shared `makeId`

**Code Quality:**
- ✅ No TypeScript errors
- ✅ Follows project patterns
- ✅ Comprehensive JSDoc comments
- ✅ All edge cases handled

---
- [ ] `src/features/budgets/model/schema.ts` (Zod schemas)

**Checklist:**
- [ ] Create `validateBudgetInput(input)` function
## ⚛️ Phase 3: React Integration (4-5 hours) ✅

### Task 3.1: DI Registration ✅
**Time:** 30 minutes | **Status:** Complete | **Actual:** ~20min

**Files modified:**
- ✅ `src/shared/di/domain-services.ts`
- ✅ `src/shared/di/types.ts`

**Checklist:**
- ✅ Register `BudgetsService` as singleton
- ✅ Register `BudgetSummaryService` as singleton
- ✅ Add BUDGETS_SERVICE and BUDGET_SUMMARY_SERVICE to DI_KEYS enum
- ✅ Export `getBudgetsService()` function
- ✅ Export `getBudgetSummaryService()` function
- ✅ Configure dependencies (BudgetSummaryService depends on BudgetsService, TransactionsRepo, CategoriesRepo)

**Acceptance Criteria:**
- ✅ Services can be accessed via getter functions
- ✅ Dependencies are correctly resolved
- ✅ No circular dependencies
- ✅ No TypeScript errors

---

### Task 3.2: React Hooks ✅
**Time:** 2 hours | **Status:** Complete | **Actual:** ~1h

**Files created:**
- ✅ `src/features/budgets/hooks/useBudgets.ts`
- ✅ `src/features/budgets/hooks/useBudgetMutation.ts`
- ✅ `src/features/budgets/hooks/useBudgetSummary.ts`
- ✅ `src/features/budgets/hooks/useCategoryBudgetSummary.ts`
- ✅ `src/features/budgets/hooks/useCategoriesWithoutBudget.ts`
- ✅ `src/features/budgets/hooks/index.ts`

**Checklist:**
- ✅ Implement `useBudgets()` hook (without SWR, simple state management)
- ✅ Implement `useBudgetMutation()` hook with create/update/delete
- ✅ Implement `useBudgetSummary(month?)` hook
- ✅ Implement `useCategoryBudgetSummary(categoryId)` hook
- ✅ Implement `useCategoriesWithoutBudget()` hook
- ✅ Add proper error handling
- ✅ Add loading states
- ✅ Follow project patterns (similar to categories/goals hooks)
- ⬜ Test hooks in development (pending UI components)

**Acceptance Criteria:**
- ✅ Hooks follow project conventions (same pattern as useCategories, useGoals)
- ✅ Error states are properly exposed
- ✅ Loading states manage async operations
- ✅ Mutations accept refresh callback for data reload
- ✅ No TypeScript errors

**Implementation Notes:**
- Used simple state management pattern (no SWR) to match existing hooks
- Separated mutation logic into `useBudgetMutation` for cleaner API
- All hooks use workspace context via `useWorkspace()`

---

### Task 3.3: Form State & Validation ✅
**Time:** 1.5 hours | **Status:** Complete | **Actual:** ~40min

**Files created:**
- ✅ `src/features/budgets/hooks/useBudgetForm.ts`

**Checklist:**
- ✅ Integrate React Hook Form
- ✅ Add form state management (BudgetFormValues type)
- ✅ Add form reset functionality
- ✅ Add form submission handling with validation
- ✅ Handle create and update modes
- ✅ Validate categoryId (required)
- ✅ Validate limitMinor (> 0)
- ⬜ Test form in development (pending UI components)

**Acceptance Criteria:**
- ✅ Form validation works client-side before submission
- ✅ Form supports both create and edit modes
- ✅ Form resets when budget prop changes
- ✅ Error messages are user-friendly
- ✅ No TypeScript errors

**Implementation Notes:**
- Project doesn't use Zod with react-hook-form, uses manual validation
- Form follows same pattern as CategoryUpsertSheet
- Currency and period are readonly in the form
- Only limitMinor can be updated in edit mode

---

### Phase 3 Summary ✅

**Total Time:** ~2 hours (faster than estimated 4-5h)

**Files Created:**
- ✅ `src/features/budgets/hooks/useBudgets.ts`
- ✅ `src/features/budgets/hooks/useBudgetMutation.ts`
- ✅ `src/features/budgets/hooks/useBudgetSummary.ts`
- ✅ `src/features/budgets/hooks/useCategoryBudgetSummary.ts`
- ✅ `src/features/budgets/hooks/useCategoriesWithoutBudget.ts`
- ✅ `src/features/budgets/hooks/useBudgetForm.ts`
- ✅ `src/features/budgets/hooks/index.ts`

**Files Modified:**
- ✅ `src/shared/di/types.ts`
- ✅ `src/shared/di/domain-services.ts`

**Code Quality:**
- ✅ No TypeScript errors
- ✅ Follows project patterns (similar to categories/goals)
- ✅ All hooks properly typed
- ✅ Error handling implemented
- ✅ Loading states managed

---

## 🎨 Phase 4: UI Components (6-8 hours)

### Task 4.1: Atomic Components ~~⬜~~ ❌ Rejected
**Status:** Rejected — not needed

**Reasoning:**
- `BudgetProgressBar` — `ProgressRing` from `shared/ui/atoms` already used in both `BudgetItem` and `TotalBudgetCard`; a linear bar was never part of the actual design
- `BudgetStatusBadge` — inline `getBudgetBadge()` in `BudgetItem` using shared `Badge` is sufficient; extracted component would be used in only one place
- `BudgetAmount` — `shownAmount()` + shared `Text` covers all formatting needs; `shared/ui/atoms/Amount` already exists if needed
- `molecules/index.ts` — already exists at `src/features/budgets/ui/molecules/index.ts`

---

### Task 4.2: Budget Cards ✅
**Time:** 2 hours | **Status:** Complete | **Actual:** ~2h

**Files created:**
- ✅ `src/features/budgets/ui/components/TotalBudgetCard/TotalBudgetCard.tsx`
- ✅ `src/features/budgets/ui/components/TotalBudgetCard/TotalBudgetCard.module.css`
- ✅ `src/features/budgets/ui/components/TotalBudgetCard/index.ts`
- ✅ `CategoryBudgetCard` — handled by existing `BudgetItem` molecule

**Checklist:**
- ✅ **TotalBudgetCard**:
  - ✅ Display total spent / total limit
  - ✅ Show ProgressRing with state-based colors
  - ✅ Display remaining amount (or "Over by X")
  - ✅ Show unbudgeted amount (if > 0)
  - ✅ Progress color: green < 80%, yellow 80–100%, red ≥ 100%
  - ✅ Loading state delegated to page-level skeleton
- ✅ **CategoryBudgetCard**: handled by existing `BudgetItem` molecule

**Acceptance Criteria:**
- ✅ Cards match design from spec section 6
- ✅ Cards are interactive
- ✅ Loading states don't cause layout shift

---

### Task 4.3: Budget Sheet (Create/Edit) ✅
**Time:** 2 hours | **Status:** Complete | **Actual:** ~2h

**Files created:**
- ✅ `src/features/budgets/ui/components/BudgetUpsertSheet/BudgetUpsertSheet.tsx`
- ✅ `src/features/budgets/ui/components/BudgetUpsertSheet/BudgetUpsertSheet.module.css`
- ✅ Exported via `src/features/budgets/ui/components/index.ts`

**Checklist:**
- ✅ Create Sheet component with form (BottomSheet + FormProvider)
- ✅ Add category select field (only expense categories without active budgets)
- ✅ Add limit amount input field
- ✅ Auto-fill currency from workspace settings
- ✅ Period is always "monthly" (hardcoded, no visible readonly field in MVP)
- ✅ Add save button
- ✅ Add cancel button (via ModalHeader onClose)
- ✅ Handle create mode
- ✅ Handle edit mode
- ✅ Show validation errors inline
- ✅ Add loading state during submission
- ✅ Close sheet on successful submission
- ✅ Reset form on close

**Acceptance Criteria:**
- ✅ Form validates input before submission
- ✅ Only valid categories appear in dropdown (expense only, no duplicate budgets)
- ✅ Amount input supports decimal values
- ✅ Sheet follows project patterns (mirrors TransactionUpsertSheet)
- ✅ Error messages are user-friendly

**Form Fields:**
- Category (select, via CategoriesSheet) - required
- Limit Amount (number input) - required, > 0
- Currency shown as right slot (readonly from workspace)

---

### Task 4.4: Budgets Page 🟡
**Time:** 2 hours | **Status:** In Progress

**Files created:**
- ✅ `src/app/(app)/budgets/page.tsx`

**Checklist:**
- ✅ Create page with header
- ✅ Add "New Budget" FAB button
- ✅ Add TotalBudgetCard at top (above category list)
- ✅ Add CategoryBudgets list section (BudgetList)
- ✅ Sort category budgets: over → warning → normal (handled in BudgetList)
- ⬜ Add "Categories Without Budget" collapsible section
- ⬜ Show spent amount for categories without budget
- ⬜ Add "Set Budget" CTA for each category without budget
- ✅ Implement empty state (no budgets created yet)
- ✅ Add loading skeleton
- ✅ Handle error state
- ⬜ Make page responsive (test)
- ⬜ Test on mobile and tablet

**Acceptance Criteria:**
- Page follows app layout structure
- All sections render correctly
- Empty state encourages creating first budget
- Page is performant (no unnecessary re-renders)
- Navigation works correctly

**Page Structure:**
```
┌─────────────────────────────────┐
│ Budgets              [+ New]    │ ← Header
├─────────────────────────────────┤
│ Total Budget Card               │
│ $1,250 / $2,000 (62%)          │
│ Unbudgeted: $150               │
├─────────────────────────────────┤
│ Category Budgets                │
│ • Food: $320 / $500            │
│ • Transport: $180 / $300       │
│ • Utilities: Over by $40       │
├─────────────────────────────────┤
│ ▼ Categories Without Budget     │
│ • Entertainment: Spent $120    │
│ • Taxi: Spent $80              │
└─────────────────────────────────┘
```

---

## 🔗 Phase 5: Integration & Polish (2-3 hours)

### Task 5.1: Navigation ⬜
**Time:** 30 minutes | **Status:** Not Started

**Files to modify:**
- [ ] `src/app/(app)/app-shell.tsx`

**Checklist:**
- [ ] Add "Budgets" link to navigation
- [ ] Add appropriate icon (Wallet or PiggyBank)
- [ ] Position in nav (between Transactions and Goals)
- [ ] Test navigation from all pages
- [ ] Update active state styling

**Acceptance Criteria:**
- Navigation item appears in sidebar
- Active state works correctly
- Icon is consistent with design system
- Navigation works on mobile (if mobile nav exists)

---

### Task 5.2: Category Delete Handling ⬜
**Time:** 1 hour | **Status:** Not Started

**Files to modify:**
- [ ] `src/features/categories/model/service.ts`

**Checklist:**
- [ ] Inject BudgetsService into CategoriesService
- [ ] When deleting category, check for associated budget
- [ ] Soft delete budget when category is deleted
- [ ] Add test case for category deletion with budget
- [ ] Document behavior in code comments

**Acceptance Criteria:**
- Deleting category also soft-deletes its budget
- Budget deletion happens in same transaction (if possible)
- No orphaned budgets remain
- Behavior follows ADR-0002 principles (category deletion semantics)

**Implementation Note:**
```typescript
async delete(id: string) {
  // Existing category delete logic
  await this.categoriesRepo.softDelete(workspaceId, id);
  
  // New: delete associated budget
  const budget = await this.budgetsService.getByCategoryId(id);
  if (budget) {
    await this.budgetsService.delete(budget.id);
  }
}
```

---

### Task 5.3: Documentation Updates ⬜
**Time:** 1 hour | **Status:** Not Started

**Files to modify:**
- [ ] `wiki/product/data-model.md`
- [ ] `wiki/planning/roadmap.md`
- [ ] `wiki/product/backlog.md`

**Checklist:**
- [ ] Add Budget section to data-model.md
- [ ] Include table with Budget schema
- [ ] Document Budget → Category relationship
- [ ] Update roadmap.md with Budget feature status
- [ ] Mark feature as "In Progress" or "Complete"
- [ ] Update completion dates
- [ ] Add Budget feature to backlog.md (or mark as done)
- [ ] Link to BUDGETS_FEATURE_SPEC.md from all docs

**Acceptance Criteria:**
- Documentation is up to date
- Links between docs work correctly
- Budget data model is clearly documented
- Roadmap reflects current reality

---

### Task 5.4: Testing & QA ⬜
**Time:** 1 hour | **Status:** Not Started

**Test Scenarios:**
- [ ] **Happy Path**: Create budget → add transactions → see progress
- [ ] **Edge Case**: Create budget without any transactions
- [ ] **Edge Case**: Spend more than budget limit
- [ ] **Edge Case**: Delete category that has budget
- [ ] **Edge Case**: Try to create duplicate budget for same category
- [ ] **Edge Case**: Reduce limit below current spending
- [ ] **UI/UX**: All components render correctly on mobile
- [ ] **UI/UX**: Empty states are clear and actionable
- [ ] **UI/UX**: Error messages are user-friendly
- [ ] **UI/UX**: Loading states don't cause layout shift
- [ ] **Performance**: Page loads quickly with many budgets
- [ ] **Performance**: Summary calculations are fast
- [ ] **Accessibility**: Keyboard navigation works
- [ ] **Accessibility**: Screen reader announces important info

**Acceptance Criteria:**
- All test scenarios pass
- No console errors or warnings
- Performance is acceptable (< 3s page load)
- Accessibility meets WCAG 2.1 AA standards

---

## 🚀 Optional Post-MVP Enhancements

### Enhancement 1: Dashboard Widget ⬜
**Time:** 2 hours | **Status:** Not Planned

**Files to create:**
- [ ] `src/features/budgets/ui/components/BudgetDashboardWidget.tsx`

**Checklist:**
- [ ] Create compact budget overview card
- [ ] Show overall progress
- [ ] Show most over-budget category
- [ ] Link to full budgets page
- [ ] Integrate into dashboard page

---

### Enhancement 2: Transaction Page Integration ⬜
**Time:** 1 hour | **Status:** Not Planned

**Files to modify:**
- [ ] `src/features/transactions/ui/components/TransactionSheet.tsx`

**Checklist:**
- [ ] Show budget remaining when selecting expense category
- [ ] Display warning if close to limit
- [ ] Show "Over budget" indicator if already exceeded

---

### Enhancement 3: Budget History ⬜
**Time:** 3 hours | **Status:** Not Planned

**Features:**
- View budget performance over past months
- Compare month-to-month spending
- Show trends (spending increasing/decreasing)

---

## 📋 Blockers & Issues

| ID | Description | Status | Assigned To | Resolution |
|----|-------------|--------|-------------|------------|
| — | None yet | — | — | — |

---

## 🔗 Related Resources

- **Specification:** [BUDGETS_FEATURE_SPEC.md](./BUDGETS_FEATURE_SPEC.md)
- **Architecture:** [wiki/development/architecture.md](../development/architecture.md)
- **Data Model:** [wiki/product/data-model.md](../product/data-model.md)
- **Roadmap:** [wiki/planning/roadmap.md](./roadmap.md)
- **Transactions Feature:** `src/features/transactions/`
- **Categories Feature:** `src/features/categories/`
- **Goals Feature:** `src/features/goals/`

---

## 📝 Notes & Decisions

### Decision Log

**[Date]** - *Decision:* ...
**Reasoning:** ...

---

## ✅ Completion Checklist

### Before Feature Launch:
- [ ] All phases completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] No console errors
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Feature flag enabled (if using feature flags)

### Post-Launch:
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Track usage metrics
- [ ] Plan post-MVP enhancements

---

**Last Updated:** February 19, 2026  
**Next Review:** TBD
