# 🚀 Development Roadmap

> **Last Updated:** February 19, 2026  
> **Project Status:** Phase 4-5 Transition

## Overview

**Fluffy** — offline-first personal finance application with cloud sync, designed for habit formation and financial awareness.

## Current Phase Status

| Phase | Name | Status | Focus |
|-------|------|--------|-------|
| 1 | Foundation | ✅ Complete | DI, Constants, Context, Repository |
| 2 | State & Validation | ✅ Complete | MetaRegistry, AppState, Validators |
| 3 | Components & UX | ✅ Complete | TransactionSheet, Design System, Pagination |
| 4 | Cloud-Sync Prep | ✅ Complete | Sync Engine, Firebase Adapter, Offline Queue |
| 5 | Design System | 🟡 In Progress | UI Tokens, Component Alignment, Responsive |
| 6 | Internationalization | 🔵 Next | i18n Setup, RU/EN Translations |
| 7 | Firebase Integration | 🔵 Planned | Real Cloud Sync, Auth Integration |
| 8 | Authentication | 🔵 Planned | Registration, Login, Session |
| 9 | PWA & Performance | 🔵 Planned | Service Worker, Lighthouse 90+ |
| 10 | Testing & QA | 🔵 Planned | Unit Tests, E2E, Coverage |

---

## ✅ Completed Work (Phases 1-4)

### Phase 1: Foundation Infrastructure
**Status:** Complete | **Duration:** 4-5 hours

✅ **Delivered:**
- DI Container (singleton/transient services)
- Constants & Defaults layer
- WorkspaceContext for global state
- Repository abstraction (Dexie + In-Memory)
- TypeScript configuration

**Key Files:** `src/shared/di/`, `src/shared/constants/`, `src/core/repos/`

---

### Phase 2: Advanced State Management
**Status:** Complete | **Duration:** 5-6 hours

✅ **Delivered:**
- MetaRegistry with 5-minute TTL caching
- AppState with 20+ actions
- React ErrorBoundary with UI fallback
- Input validators with error codes
- Logger with performance tracking

**Key Files:** `src/core/meta-registry/`, `src/shared/state/`, `src/shared/validation/`

---

### Phase 3: Component Refactoring & Design System
**Status:** Complete | **Duration:** 6-7 hours

✅ **Delivered:**
- TransactionSheet: 353 → 140 lines (-60%)
- 6 reusable UI components (Button, Input, Card, Badge, Select, Modal)
- Design System foundations (spacing, typography, colors)
- Pagination with virtual scrolling
- Backup/Restore functionality

**Impact:** 60% code reduction, reusable component library, better maintainability

---

### Phase 4: Cloud-Sync Preparation & Infrastructure
**Status:** Complete | **Duration:** 6-8 hours

✅ **Delivered:**
- Sync Engine with delta-sync, offline queue, conflict resolution
- SyncAdapter interface for cloud providers
- Firebase adapter (skeleton with TODOs)
- Sync UI components (badge, indicator, panel, modal)
- Database schema v6 with sync fields
- Comprehensive documentation (5 guides)

**Key Files:** `src/core/sync/`, `src/core/cloud/`, `docs/CLOUD_SYNC_GUIDE.md`

---

## 🟡 Current Focus (Phase 5)

### Phase 5: Design System & UI Implementation
**Status:** In Progress | **Expected:** 8-10 hours

**Objectives:**
- Implement unified design system from product docs
- Standardize spacing, typography, colors across app
- Ensure mobile-first responsive design
- Prepare foundation for Phase 6 (i18n)

**Key Deliverables:**
1. Design Tokens (Tailwind config, CSS variables)
2. Component Library Audit (align all components)
3. Page Layout Standardization (consistent spacing)
4. Dashboard Refinement (visual clarity)
5. Typography System (unified text roles)
6. Form & Input Improvements (validation styling)
7. Color Palette (consistent application)
8. Mobile-First Verification (responsive testing)
9. Component Documentation (guides)

**Expected Outcome:**
- Production-ready UI with visual consistency
- All pages responsive (mobile/tablet/desktop)
- WCAG AA accessibility compliance
- Lighthouse score 90+

**Files to Create/Update:**
- `tailwind.config.ts` (extended tokens)
- `src/shared/design/tokens.ts`, `theme.css`, `typography.css`
- `src/shared/ui/` (all components aligned)
- `src/app/(app)/*/page.tsx` (all pages refined)

---

## 🔵 Next Steps (Phases 6-10)

### Phase 6: Internationalization (i18n) - RU/EN
**Status:** Planned | **Estimate:** 6-8 hours

**Objectives:**
- Add full multilingual support (Russian + English)
- Implement locale routing and detection
- Localize dates, numbers, currency formatting
- Provide language switcher in UI

**Key Tasks:**
1. i18n Infrastructure (next-intl configuration)
2. Translation Files (en.json, ru.json + features)
3. Locale Routing & Middleware (URL prefixes, detection)
4. Component Updates (useTranslation() throughout)
5. Locale-Specific Formatting (dates, numbers, currency)
6. Language Selector UI (Settings page)
7. Testing & QA (both languages verified)

**Expected Outcome:**
- Bilingual application (RU & EN)
- Easy to add more languages in future
- Proper formatting per locale

---

### Phase 7: Firebase Real Integration
**Status:** Planned | **Estimate:** 6-8 hours

**Objectives:**
- Replace Firebase adapter TODOs with real SDK calls
- Implement real cloud sync (push/pull/resolve)
- Add auth integration with sync
- Test multi-device synchronization

**Key Tasks:**
1. Install Firebase SDK
2. Implement real `push()`, `pull()`, `pullSince()`, `resolveConflict()`
3. Add auth-aware sync (user ID in sync metadata)
4. Test offline → online sync flow
5. Handle Firestore security rules
6. Test conflict resolution in real scenario
7. Performance testing (sync time, bandwidth)

---

### Phase 8: Authentication System
**Status:** Planned | **Estimate:** 5-6 hours

**Objectives:**
- Implement user registration & login
- Add session management
- Integrate with cloud sync (user-specific data)

**Key Tasks:**
1. Create registration page
2. Create login page
3. Add password reset flow
4. Implement session management
5. Protect routes (AuthGuard)
6. User profile management
7. Integration with Firebase Auth

---

### Phase 9: PWA & Performance Optimization
**Status:** Planned | **Estimate:** 4-5 hours

**Objectives:**
- Make app installable (PWA)
- Optimize for performance (Lighthouse 90+)
- Add service worker caching strategy
- Improve Core Web Vitals

**Key Tasks:**
1. Add service worker with caching strategy
2. Create Web App Manifest
3. Optimize bundle size
4. Image optimization
5. Code splitting
6. Lighthouse optimization
7. Install prompt UI

---

### Phase 10: Testing & Quality Assurance
**Status:** Planned | **Estimate:** 8-10 hours

**Objectives:**
- Comprehensive test coverage
- E2E testing for critical flows
- Performance benchmarking
- Documentation finalization

**Key Tasks:**
1. Unit tests (utilities, services, components)
2. Integration tests (features end-to-end)
3. E2E tests (user flows with Playwright)
4. Performance tests (Lighthouse CI)
5. Accessibility tests (WCAG AA)
6. Manual QA (all browsers/devices)
7. Documentation (API, deployment, troubleshooting)
8. Release preparation

**Expected Outcome:**
- 80%+ code coverage
- Critical flows E2E tested
- Production-ready code quality
- Complete documentation

---

## Timeline Estimate

**February 2026 - March 2026:**
- ✅ Phase 1-4: Complete (foundation laid)
- 🟡 Phase 5: In Progress (~2 days)
- 🔵 Phase 6: ~1.5 days
- 🔵 Phase 7: ~1.5 days
- 🔵 Phase 8: ~1 day
- 🔵 Phase 9: ~1 day
- 🔵 Phase 10: ~2 days

**Total remaining:** ~9 days of active development

---

## Key Milestones

### ✅ Milestone 1: MVP Core (Phases 1-3)
- Fully functional offline app
- Basic transactions, budgets, goals
- Good code quality (DI, composition)
- Responsive design

### ✅ Milestone 2: Sync Ready (Phase 4)
- Cloud-sync infrastructure ready
- Firebase adapter skeleton
- Offline queue & conflict resolution
- Sync UI components

### 🎯 Milestone 3: Production Design + Global (Phases 5-6)
**Target:** March 2026
- Professional UI consistent with product vision
- Bilingual (RU/EN)
- Ready for broader audience

### 📅 Milestone 4: Enterprise Ready (Phases 7-10)
**Target:** March-April 2026
- Real cloud sync
- User authentication
- Installable PWA
- Production quality testing

---

## Technology Stack

- **Runtime:** Next.js 15, React 19, TypeScript 5
- **Database:** IndexedDB (Dexie.js), Firestore (Phase 7+)
- **UI:** Tailwind CSS 4, shadcn/ui, Lucide Icons
- **State:** React Context, custom hooks
- **Testing:** Vitest, Playwright (Phase 10)
- **i18n:** next-intl (Phase 6)
- **Auth:** Firebase Auth (Phase 8)
- **PWA:** Service Worker API (Phase 9)

---

## Success Criteria

| Phase | Success Metric |
|-------|---|
| 1-4 | ✅ All infrastructure in place |
| 5 | Lighthouse 90+, zero hardcoded styles |
| 6 | 100% text translated, locale switching works |
| 7 | Multi-device sync tested and verified |
| 8 | Auth flow complete, user data protected |
| 9 | App installable, Core Web Vitals green |
| 10 | 80%+ coverage, zero critical bugs |

---

## Next Features (Post-Phase 5)

### Budgets Feature (MVP)
**Status:** � In Progress (~88%) | **Estimate:** 20-24 hours | **Actual:** ~16h

**Overview:**
Category-based budgeting with computed overall budget, unbudgeted spend tracking, and progress monitoring.

**Delivered:**
- ✅ Budget data model, Dexie schema (v9), repository
- ✅ BudgetsService + BudgetSummaryService with full calculations
- ✅ React hooks (useBudgets, useBudgetSummary, useBudgetMutation, etc.)
- ✅ UI: BudgetItem molecule, TotalBudgetCard, BudgetList, BudgetUpsertSheet
- ✅ /budgets page (list, empty state, error state, loading skeleton)

**Remaining:**
- ⬜ "Categories Without Budget" section on /budgets page
- ⬜ Navigation entry in app-shell
- ⬜ Soft-delete budget when category is deleted

**Documentation:**
- [Budgets Feature Spec](BUDGETS_FEATURE_SPEC.md)
- [Implementation Tracker](BUDGETS_IMPLEMENTATION_TRACKER.md)

---

## Post-Launch Vision

After Phase 10 completion, foundation for:
- Family shared workspaces
- AI financial insights
- Bank integrations
- Mobile native apps (React Native)
- Advanced analytics

---

## Related Documentation

- [Current Status](current-status.md) - What's happening now
- [Backlog](../product/backlog.md) - Feature backlog
- [Architecture](../development/architecture.md) - Technical architecture
- [Design System](../design/README.md) - UI guidelines
