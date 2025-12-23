# 🎨 Phase 5: Design System & UI Implementation

## Overview

Фаза 5 сфокусирована на **полной реализации дизайн-системы в соответствии с product docs** и приведении всех компонентов в соответствие с установленными принципами.

**Status:** Ready to Start (после завершения Phase 4)  
**Duration:** ~8-10 часов  
**Impact:** UI/UX качество → production-ready interface

---

## Ключевые цели

1. **Реализовать unified design system** согласно "9. Design System Lite.md"
2. **Привести все UI компоненты в соответствие** с UX principles
3. **Обеспечить consistency** во всём приложении
4. **Оптимизировать spacing, typography, colors** по Tailwind scale
5. **Подготовить базу для Phase 6 (i18n)**

---

## Phase 5 Tasks

### 5.1 - Design Tokens & Theme Configuration

**Priority:** 🔥 P0  
**Duration:** 1.5 hours

**Purpose:** Создать единую систему дизайн-токенов

**Subtasks:**
- [ ] Tailwind config upgrade (spacing, colors, typography)
- [ ] CSS variables for theme (light/dark ready)
- [ ] Typography scale (Display, H1, H2, Body, Caption)
- [ ] Color palette (bg, text, accent, error, success, warning)
- [ ] Spacing & border-radius constants

**Files to Create/Update:**
```
tailwind.config.ts         ✏️ expand theme
src/shared/design/
├── tokens.ts            (100 lines) - const definitions
├── theme.css            (150 lines) - CSS variables
└── typography.css       (80 lines)  - font scales
```

**Key Values:**
```typescript
// Spacing scale (Tailwind already has, but formalize)
xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px

// Typography roles
Display: 28px/bold (for sums)
H1: 24px/semibold (screen titles)
H2: 18px/semibold (sections)
Body: 14px/regular (main text)
Caption: 12px/regular (secondary)

// Color roles
Primary: accent (blue/green)
Secondary: muted (gray)
Success: green (progress)
Warning: yellow/orange
Danger: red
Neutral: black/white + grays
```

---

### 5.2 - Component Library Audit & Alignment

**Priority:** 🔥 P0  
**Duration:** 2 hours

**Purpose:** Проверить все компоненты, привести их в соответствие с дизайн-системой

**Subtasks:**
- [ ] Audit `src/shared/ui/button.tsx` → align variants & spacing
- [ ] Audit `src/shared/ui/input.tsx` → consistent styling
- [ ] Audit all `shadcn/ui` components → override defaults if needed
- [ ] Create `src/shared/ui/card.tsx` → unified card component
- [ ] Create `src/shared/ui/badge.tsx` → status indicators
- [ ] Document component variants & usage

**Files to Create/Update:**
```
src/shared/ui/
├── button.tsx           ✏️ ensure consistency
├── input.tsx            ✏️ ensure consistency
├── card.tsx             ✨ new (unified wrapper)
├── badge.tsx            ✨ new (for statuses)
├── select.tsx           ✏️ if not done
└── COMPONENT_GUIDE.md   ✨ new (documentation)
```

**Acceptance Criteria:**
- [ ] All buttons follow 4 variants (primary, secondary, danger, ghost)
- [ ] All inputs have consistent border/focus styles
- [ ] Cards use unified padding (p-4 mobile, p-6 desktop)
- [ ] No inline styles in components
- [ ] Component guide documents all variants

---

### 5.3 - Page Layout Standardization

**Priority:** P0  
**Duration:** 2 hours

**Purpose:** Стандартизировать layout всех страниц согласно product design

**Subtasks:**
- [ ] Dashboard layout → grid, spacing, responsive
- [ ] Transactions layout → list + filters, spacing
- [ ] Budgets layout → cards, progress bars, spacing
- [ ] Goals layout → cards, progress, spacing
- [ ] Settings layout → form sections, spacing
- [ ] Create layout templates for reuse

**Files to Create/Update:**
```
src/shared/ui/layouts/
├── page-layout.tsx      ✨ new (standard page wrapper)
├── section-layout.tsx   ✨ new (section with title)
└── LAYOUT_GUIDE.md      ✨ new
```

**Key Principles:**
- Mobile: `px-4 py-4`, Desktop: `px-8 py-6`
- Sections separated by `gap-6`
- Cards have `p-4` (mobile) / `p-6` (desktop)
- Consistent grid: 2-col mobile, 3-col desktop
- Always responsive (no fixed widths)

---

### 5.4 - Dashboard Visual Refinement

**Priority:** P0  
**Duration:** 1.5 hours

**Purpose:** Привести dashboard в соответствие с дизайн-системой

**Subtasks:**
- [ ] Refine totals section (cards → consistent style)
- [ ] Refine balance display (typography scale)
- [ ] Refine budget cards → progress bars
- [ ] Refine goals section → visual clarity
- [ ] Add smooth transitions/animations where needed
- [ ] Test responsive behavior

**Files to Update:**
```
src/app/(app)/dashboard/page.tsx
src/features/dashboard/ui/*.tsx (all components)
```

**Visual Goals:**
- Spacious, calm feeling
- Clear hierarchy (titles > numbers > details)
- Smooth scroll, no janky transitions
- Empty states have personality + CTA

---

### 5.5 - Typography System Implementation

**Priority:** P1  
**Duration:** 1.5 hours

**Purpose:** Реализовать unified typography scale

**Subtasks:**
- [ ] Create typography utility classes (in tailwind or as component)
- [ ] Replace all hardcoded font sizes with system
- [ ] Update all page titles to use H1/H2 consistently
- [ ] Update all numbers to use Display role
- [ ] Document typography rules in STYLE_GUIDE.md

**Files to Create/Update:**
```
src/shared/design/typography.ts
src/shared/ui/typography/
├── heading.tsx          ✨ new (H1, H2, H3)
├── text.tsx             ✨ new (Body, Caption)
├── display.tsx          ✨ new (for numbers)
└── index.ts
```

**Usage Pattern:**
```tsx
// Instead of:
<div className="text-2xl font-semibold">Total</div>

// Use:
<Heading level={1}>Total</Heading>
<Display value={1234} /> // for numbers
```

---

### 5.6 - Form & Input Refinement

**Priority:** P1  
**Duration:** 1 hour

**Purpose:** Улучшить все формы и инпуты

**Subtasks:**
- [ ] Standardize form layout (labels, inputs, validation)
- [ ] Add consistent error message styling
- [ ] Add success/validation feedback
- [ ] Improve placeholder text consistency
- [ ] Test accessibility (focus states, keyboard nav)

**Files to Update:**
```
src/features/transactions/ui/transaction-sheet.tsx
src/features/budgets/ui/budget-limit-sheet.tsx
src/features/goals/ui/goal-quick-add-sheet.tsx
src/shared/ui/form/ (create if needed)
```

**Acceptance Criteria:**
- [ ] All inputs have visible focus state
- [ ] All errors show inline, next to field
- [ ] Labels are always visible
- [ ] Placeholder text is helpful
- [ ] Forms work on mobile keyboard

---

### 5.7 - Color Palette & Theme

**Priority:** P1  
**Duration:** 1 hour

**Purpose:** Финализировать цветовую палитру и её использование

**Subtasks:**
- [ ] Define primary, secondary, accent colors
- [ ] Define status colors (success, warning, error, info)
- [ ] Apply consistently across app
- [ ] Ensure WCAG contrast ratios
- [ ] Test light/dark mode ready (prepare for future)

**Files to Update:**
```
tailwind.config.ts
src/shared/design/theme.css
All UI component files
```

**Color Guidelines:**
- Primary text: black/white (sufficient contrast)
- Secondary: gray-600/gray-400
- Success: green (confident)
- Warning: amber/yellow (cautious)
- Error: red (but not aggressive)
- Accent: one consistent color for CTAs

---

### 5.8 - Mobile-First Responsive Verification

**Priority:** P1  
**Duration:** 1.5 hours

**Purpose:** Убедиться, что всё идеально работает на мобильном

**Subtasks:**
- [ ] Test all pages on 375px width (iPhone SE)
- [ ] Test all pages on 768px width (iPad)
- [ ] Test all pages on 1024px+ (desktop)
- [ ] Fix any layout breakage
- [ ] Verify touch targets (min 44px height)
- [ ] Test on actual devices if possible

**Files to Test:**
- All pages in `src/app/(app)/*/page.tsx`
- All sheets/modals in `src/features/*/ui/`

**Acceptance Criteria:**
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥ 44px
- [ ] Text readable on small screens
- [ ] Buttons accessible with thumbs
- [ ] Forms work on mobile keyboards

---

### 5.9 - Component Documentation & Storybook (Optional for Phase 5)

**Priority:** P2  
**Duration:** 2 hours (optional)

**Purpose:** Документировать компоненты для удобства разработки

**Subtasks:**
- [ ] Create COMPONENT_USAGE.md (examples of all components)
- [ ] Add JSDoc comments to all UI components
- [ ] Create visual style guide (screenshots/examples)
- [ ] Document spacing rules with examples
- [ ] Document typography with samples

**Files to Create:**
```
docs/DESIGN_SYSTEM.md        ✨ (500+ lines)
docs/COMPONENT_USAGE.md      ✨ (examples)
src/shared/ui/GUIDE.md       ✨ (quick reference)
```

---

## Definition of Done (Phase 5)

- [ ] Tailwind config fully extended with design tokens
- [ ] All components updated to follow design system
- [ ] All pages responsive (mobile/tablet/desktop)
- [ ] Typography system implemented uniformly
- [ ] Color palette applied consistently
- [ ] No visual inconsistencies between pages
- [ ] Forms have proper validation styling
- [ ] All touch targets ≥ 44px on mobile
- [ ] Design system documented
- [ ] Code review passed

---

## Success Metrics

- **Visual Consistency:** no random paddings/sizes
- **Responsive Quality:** 100% mobile, tablet, desktop pass
- **Accessibility:** WCAG AA contrast, keyboard nav works
- **Performance:** Lighthouse score 90+ (performance)
- **Code Quality:** no inline styles, all in Tailwind/tokens

---

## Deliverables

1. **Updated design system** (tokens, colors, typography)
2. **Refactored UI components** (button, input, card, badge)
3. **Responsive layouts** (all pages tested)
4. **Design documentation** (DESIGN_SYSTEM.md)
5. **Component examples** (COMPONENT_USAGE.md)

---

## Notes

- Phase 5 можно начать параллельно с завершением Phase 4
- Design system — основа для Phase 6 (i18n)
- Все решения должны быть документированы для consistency в будущих фазах
- После Phase 5: приложение готово к production (UX-wise)
