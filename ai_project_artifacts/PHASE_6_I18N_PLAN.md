# 🌍 Phase 6: Internationalization (i18n) - RU/EN

## Overview

Фаза 6 добавляет полную поддержку мультиязычности (русский и английский).

**Status:** Ready to Start (после Phase 5)  
**Duration:** ~6-8 часов  
**Impact:** Открывает приложение для английской аудитории

---

## Ключевые цели

1. **Реализовать i18n инфраструктуру** (next-intl или аналог)
2. **Перевести все UI текст** (RU ↔ EN)
3. **Локализовать даты, числа, валюты**
4. **Добавить выбор языка в Settings**
5. **Сохранять выбранный язык** в storage

---

## Phase 6 Tasks

### 6.1 - i18n Infrastructure Setup

**Priority:** 🔥 P0  
**Duration:** 2 hours

**Purpose:** Настроить систему переводов

**Subtasks:**
- [ ] Install & configure `next-intl` (или `next-i18next`)
- [ ] Configure routing for `/en` и `/ru`
- [ ] Create translation file structure
- [ ] Set up default locale detection
- [ ] Create translation utility functions

**Files to Create:**
```
src/shared/i18n/
├── config.ts              (80 lines) - i18n configuration
├── locales/
│   ├── ru.json           (core translations RU)
│   ├── en.json           (core translations EN)
│   └── README.md
├── utils.ts              (50 lines) - translation helpers
└── index.ts

middleware.ts             ✏️ update (locale routing)
next.config.ts           ✏️ update (i18n plugin)
```

**Key Configuration:**
```typescript
// config.ts
export const locales = ['en', 'ru'] as const;
export const defaultLocale = 'ru' as const;
export type Locale = typeof locales[number];

// Translation JSON structure
{
  "common": {
    "add": "Add",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "transactions": "Transactions",
    ...
  }
}
```

---

### 6.2 - Translation File Structure & Content

**Priority:** 🔥 P0  
**Duration:** 2 hours

**Purpose:** Создать полный набор переводов для всего приложения

**Subtasks:**
- [ ] Create core translations (common words)
- [ ] Create feature-specific translations (transactions, budgets, goals)
- [ ] Create error messages translations
- [ ] Create page titles translations
- [ ] Create status messages translations
- [ ] Organize translations hierarchically (no flat structure)

**Files Structure:**
```
src/shared/i18n/locales/
├── en/
│   ├── common.json        (100 lines)
│   ├── navigation.json    (30 lines)
│   ├── transactions.json  (50 lines)
│   ├── budgets.json       (40 lines)
│   ├── goals.json         (40 lines)
│   ├── dashboard.json     (30 lines)
│   ├── settings.json      (30 lines)
│   ├── errors.json        (40 lines)
│   └── validation.json    (30 lines)
└── ru/
    └── (same structure)
```

**Translation Scope:**
- Page titles & headings
- Form labels & placeholders
- Button labels
- Navigation items
- Error messages
- Success messages
- Status indicators
- Tooltips & help text
- Empty states
- Confirmation dialogs

**Example ru.json:**
```json
{
  "common": {
    "save": "Сохранить",
    "cancel": "Отменить",
    "delete": "Удалить",
    "edit": "Редактировать"
  },
  "navigation": {
    "dashboard": "Обзор",
    "transactions": "Операции",
    "budgets": "Бюджеты",
    "goals": "Цели",
    "settings": "Настройки"
  },
  "transactions": {
    "title": "Операции",
    "addIncome": "Добавить доход",
    "addExpense": "Добавить расход",
    "empty": "Нет операций"
  }
}
```

---

### 6.3 - Locale Routing & Middleware

**Priority:** 🔥 P0  
**Duration:** 1.5 hours

**Purpose:** Настроить правильную маршрутизацию по языкам

**Subtasks:**
- [ ] Configure locale prefix routing (`/en/dashboard`, `/ru/dashboard`)
- [ ] Add middleware for locale detection
- [ ] Add language switcher in header/navigation
- [ ] Handle locale persistence in storage
- [ ] Redirect default locale to user's preference

**Files to Create/Update:**
```
middleware.ts                ✏️ update (locale routing logic)
src/app/layout.tsx          ✏️ update (locale provider)
src/shared/i18n/
├── middleware.ts            ✨ new (locale detection)
└── use-locale.ts            ✨ new (React hook)
```

**Middleware Logic:**
```typescript
// Detect user's preferred language from:
// 1. URL prefix (already routed)
// 2. localStorage (if user selected before)
// 3. Accept-Language header (browser preference)
// 4. Default: 'ru'
```

---

### 6.4 - Update All Components for i18n

**Priority:** P0  
**Duration:** 3 hours

**Purpose:** Интегрировать переводы во все компоненты

**Subtasks:**
- [ ] Update all pages with `useTranslation()` hook
- [ ] Update all features components
- [ ] Update all shared UI components
- [ ] Update all error messages
- [ ] Update all empty states
- [ ] Replace all hardcoded strings

**Files to Update (Examples):**
```
src/app/(app)/dashboard/page.tsx         ✏️
src/app/(app)/transactions/page.tsx      ✏️
src/app/(app)/budgets/page.tsx           ✏️
src/app/(app)/goals/page.tsx             ✏️
src/app/(app)/settings/page.tsx          ✏️

src/features/*/ui/*.tsx                  ✏️ (all features)
src/shared/ui/quick-add-fab.tsx          ✏️
src/shared/ui/components/*.tsx           ✏️
```

**Pattern:**
```typescript
// Before
<h1>Обзор · {summary.label}</h1>

// After
import { useTranslation } from '@/shared/i18n/use-translation';
function DashboardPage() {
  const t = useTranslation();
  return <h1>{t('dashboard.title')} · {summary.label}</h1>
}
```

---

### 6.5 - Locale-Specific Formatting

**Priority:** P1  
**Duration:** 1.5 hours

**Purpose:** Правильно форматировать даты, числа, валюты по локали

**Subtasks:**
- [ ] Configure number formatting (decimals, thousands separator)
- [ ] Configure date formatting (locale-specific)
- [ ] Configure currency formatting (symbol position)
- [ ] Update all number displays in app
- [ ] Update all date displays in app
- [ ] Create formatting utilities

**Files to Create/Update:**
```
src/shared/lib/
├── formatter.ts          ✏️ update (add locale support)
└── date-formatter.ts     ✨ new (locale-aware dates)

src/shared/i18n/
└── formatters.ts         ✨ new (i18n-aware formatting)
```

**Formatting Examples:**
```typescript
// Numbers
EN: 1,234.56
RU: 1 234,56

// Dates
EN: Dec 23, 2025
RU: 23 декабря 2025

// Currency
EN: $1,234.56
RU: 1 234,56 ₽
```

---

### 6.6 - Language Selector in Settings

**Priority:** P1  
**Duration:** 1 hour

**Purpose:** Добавить UI для выбора языка

**Subtasks:**
- [ ] Create language selector component
- [ ] Add to Settings page
- [ ] Save selection to localStorage
- [ ] Redirect on language change
- [ ] Show current language in header (optional)

**Files to Create/Update:**
```
src/features/settings/ui/
├── language-selector.tsx     ✨ new (language picker)
└── index.ts                  ✏️

src/app/(app)/settings/page.tsx  ✏️ (add language selector)
```

**Component:**
```tsx
export function LanguageSelector() {
  const currentLocale = useLocale();
  
  return (
    <div>
      <h3>Language / Язык</h3>
      <select value={currentLocale} onChange={handleChange}>
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
}
```

---

### 6.7 - Testing & QA for i18n

**Priority:** P1  
**Duration:** 1.5 hours

**Purpose:** Убедиться, что переводы работают везде

**Subtasks:**
- [ ] Test all pages in both languages
- [ ] Check for missing translations
- [ ] Test language switching
- [ ] Test locale persistence
- [ ] Verify formatting (dates, numbers, currency)
- [ ] Check for UI breaking (long text in other languages)
- [ ] Test on mobile & desktop

**QA Checklist:**
- [ ] All text is translated (no English on RU page, no RU on EN page)
- [ ] Dates display in locale format
- [ ] Numbers display correctly (comma vs dot)
- [ ] Currency symbols positioned correctly
- [ ] Language selector works
- [ ] Language preference persists on reload
- [ ] No console errors about missing translations

---

### 6.8 - i18n Documentation

**Priority:** P2  
**Duration:** 1 hour

**Purpose:** Документировать систему переводов для будущих разработчиков

**Files to Create:**
```
docs/
├── I18N.md               ✨ new (i18n guide)
└── TRANSLATION_GUIDE.md  ✨ new (how to add new translations)

src/shared/i18n/
└── README.md             ✨ new (structure overview)
```

**Documentation Content:**
- How translations are organized
- How to add new translations
- How to use `useTranslation()` hook
- How to format dates/numbers
- Common pitfalls & solutions

---

## Definition of Done (Phase 6)

- [ ] next-intl (or chosen solution) configured
- [ ] All UI text translated to EN & RU
- [ ] Locale routing working (URL prefixes)
- [ ] Language switcher in Settings
- [ ] Language preference persists
- [ ] Dates formatted per locale
- [ ] Numbers formatted per locale
- [ ] Currency formatted per locale
- [ ] No missing translation keys
- [ ] All pages tested in both languages
- [ ] Mobile & desktop layouts work in both languages
- [ ] Documentation complete

---

## Success Metrics

- **Translation Coverage:** 100% of user-facing text
- **Locale Support:** EN & RU working identically
- **Formatting:** Dates/numbers/currency per locale
- **UX:** Language switcher discoverable
- **Performance:** No i18n latency
- **Code Quality:** No hardcoded strings

---

## Deliverables

1. **i18n Infrastructure** (next-intl configured)
2. **Complete Translations** (en.json, ru.json with all files)
3. **Locale Routing** (middleware, URL prefixes)
4. **Language Selector UI** (in Settings)
5. **i18n Documentation** (TRANSLATION_GUIDE.md)

---

## Post-Phase 6

After Phase 6 is complete:
- Application is **bilingual** (RU/EN)
- Trivially easy to add more languages
- All UI text is externalized
- Foundation for future localization (dates, currencies, etc.)

---

## Notes

- Phase 6 depends on Phase 5 (design system) being complete
- Can add more languages later (just copy .json files)
- Use `next-intl` (recommended) or `next-i18next` (alternative)
- Consider plural forms for RU (different pluralization rules)
- Consider RTL languages in future (if needed)

---

## Next Steps After Phase 6

1. **Phase 7:** Firebase Integration (real cloud sync)
2. **Phase 8:** Auth Implementation (registration, login)
3. **Phase 9:** PWA & Performance (service worker, installable)
4. **Phase 10:** Testing & QA (unit, e2e, coverage)
