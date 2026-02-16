# 📋 Product Backlog

> **Last Updated:** February 2026  
> **Status:** Active development, priorities updated

## Backlog Principles

Before reviewing the list, core rules:

1. **Core flow > everything else**
2. Each story must:
   - Be implementable by one person
   - Provide tangible user value
3. No "technical tasks without user meaning" — they go as subtasks
4. Priority = contribution to habit formation

---

## Implementation Status

### ✅ Implemented (MVP Complete)
- EPIC 2: Quick transaction entry (CORE)
- EPIC 3: Transaction list
- EPIC 4: Categories
- EPIC 5: Dashboard
- EPIC 6: Goals and progress
- EPIC 7: Settings (basic)
- EPIC 8: UX quality and infrastructure

### 🔵 Planned
- EPIC 1: Authentication and basic access

---

## EPIC 1. Authentication and Basic Access

### Story 1.1 — Email Registration

**Priority:** P1  
**Status:** 🔵 Planned (Phase 8)  
**Description:**  
As a user, I want to register via email to start tracking my finances.

**Acceptance Criteria:**
- email + password
- error validation
- successful login after registration

---

### Story 1.2 — Application Login

**Priority:** P1  
**Status:** 🔵 Planned (Phase 8)  
**AC:**
- login with email + password
- session persistence
- redirect to dashboard

---

### Story 1.3 — Password Reset

**Priority:** P2  
**Status:** 🔵 Planned (Phase 8)  
**AC:**
- reset form
- success notification

---

## EPIC 2. Quick Income and Expense Entry (CORE)

### Story 2.1 — Global "Add Entry" Action

**Priority:** 🔥 P0  
**Status:** ✅ Implemented  
**Description:**  
As a user, I want to add an expense or income in seconds from any screen.

**AC:**
- ✅ always available (FAB / topbar)
- ✅ opens modal / bottom sheet
- ✅ focus on "Amount" field

---

### Story 2.2 — Entry Creation (Minimal Set)

**Priority:** 🔥 P0  
**Status:** ✅ Implemented  
**AC:**
- ✅ amount (required)
- ✅ type: expense / income
- ✅ date (default: today)
- ✅ category (optional)
- ✅ save without errors

---

### Story 2.3 — Input Error Tolerance

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ cannot save empty amount
- ✅ errors don't block UI
- ✅ user can close form without consequences

---

## EPIC 3. Transaction List

### Story 3.1 — View Transaction List

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ list sorted by date
- ✅ scrolling works smoothly
- ✅ empty state with CTA

---

### Story 3.2 — Edit Transaction

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ tap on transaction → edit modal
- ✅ can change amount, date, category
- ✅ changes saved immediately

---

### Story 3.3 — Delete Transaction

**Priority:** P2  
**Status:** ✅ Implemented  
**AC:**
- ✅ deletion confirmation
- ✅ transaction disappears from list
- ✅ data recalculated

---

## EPIC 4. Categories

### Story 4.1 — Default Categories

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ basic set available
- ✅ can use immediately
- ✅ categories not mandatory

---

### Story 4.2 — Category CRUD

**Priority:** P2  
**Status:** ✅ Implemented  
**AC:**
- ✅ create
- ✅ rename
- ✅ delete (without breaking data)

---

## EPIC 5. Dashboard (Visual Clarity)

### Story 5.1 — Period Summary

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ income total
- ✅ expense total
- ✅ period (month by default)

---

### Story 5.2 — Quick Action Access

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ CTA "Add expense"
- ✅ links to Goals and Transactions

---

## EPIC 6. Goals and Progress

### Story 6.1 — Goal Creation

**Priority:** 🔥 P0  
**Status:** ✅ Implemented  
**AC:**
- ✅ name
- ✅ target amount
- ✅ progress displayed = 0%

---

### Story 6.2 — View Goals List

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ visual progress
- ✅ clear labels
- ✅ empty state with CTA

---

### Story 6.3 — Contribute to Goal

**Priority:** 🔥 P0  
**Status:** ✅ Implemented  
**AC:**
- ✅ amount input
- ✅ progress updates immediately
- ✅ no complex screens

---

## EPIC 7. Settings (Minimum)

### Story 7.1 — Currency

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ currency selection
- ✅ applied to all amounts

---

### Story 7.2 — Profile

**Priority:** P2  
**Status:** ✅ Implemented  
**AC:**
- ✅ basic information
- ✅ logout functionality

---

## EPIC 8. UX Quality and Basic Infrastructure

### Story 8.1 — Empty States

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ for dashboard
- ✅ for transactions
- ✅ for goals

---

### Story 8.2 — Loading & Skeleton

**Priority:** P1  
**Status:** ✅ Implemented  
**AC:**
- ✅ no "jumping" UI
- ✅ clear loading expectation

---

## Priority Legend

- 🔥 **P0** - Critical path, blocks everything
- **P1** - High priority, needed for MVP
- **P2** - Nice to have, can be deferred

---

## Status Legend

- ✅ **Implemented** - Complete and working
- 🟡 **In Progress** - Currently being developed
- 🔵 **Planned** - Scheduled for future phases
- ⚪ **Backlog** - Not yet prioritized

---

## Next Priorities (Post-MVP)

### Phase 8: Authentication (Planned)
- Story 1.1: Email Registration
- Story 1.2: Application Login
- Story 1.3: Password Reset

### Future Epics (Not Yet Defined)
- Multi-user workspaces
- Advanced analytics
- Bank integrations
- Budget templates
- Recurring transactions
- Reports and exports
- Mobile native apps

---

## Related Documentation

- [Roadmap](../planning/roadmap.md) - Development roadmap
- [Current Status](../planning/current-status.md) - Project status
- [Vision](vision.md) - Product vision
- [Data Model](data-model.md) - Data structure
