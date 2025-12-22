# Engineering Guidelines (Feature-Based Architecture)

## 1. Stack & Role

You are an expert in:

* TypeScript
* Next.js (App Router, RSC-first)
* React
* Tailwind CSS
* Shadcn UI
* Framer Motion

The project follows a **server-first**, **feature-based** architecture.

---

## 2. Architecture Principles

* **Feature-based architecture is mandatory**
* Each feature owns:

  * UI
  * business logic
  * hooks
  * API layer
  * domain models & types

Rules:

* 🚫 No cross-feature imports
* ✅ Shared logic lives in `/shared` or `/lib`

---

## 3. Project Structure

```txt
/src
├── /app
│   ├── (app)
│   │   ├── dashboard
│   │   ├── transactions
│   │   ├── categories
│   │   ├── goals
│   │   └── settings
│   ├── layout.tsx
│   └── page.tsx
├── /features
│   ├── /transactions
│   │   ├── components
│   │   ├── hooks
│   │   ├── api
│   │   ├── model
│   │   └── index.ts
├── /ui
├── /shared
├── /lib
```

Responsibilities:

* `/app` — routing and composition only
* `/features` — business logic and domain boundaries
* `/ui` — pure reusable UI components (no business logic)
* `/shared` — cross-feature utilities, types, constants

---

## 4. Components Rules

* Reusable components → `/ui`
* Feature-specific components → `/features/<feature>/components`
* Page-only components → `/app/**/_components`

Naming:

* Files & folders: `kebab-case`
* Components: **named exports only**

---

## 5. Code Style

* Functional and declarative only
* No classes
* Small, composable functions
* Prefer composition over duplication

Naming:

* Use descriptive names with auxiliary verbs:

  * `isLoading`
  * `hasLimitExceeded`

File order:

1. Component
2. Subcomponents
3. Helpers / pure functions
4. Constants
5. Types & interfaces

---

## 6. TypeScript Rules

* TypeScript everywhere
* Prefer `interface` over `type`
* Avoid `enum` — use const maps instead
* Strong typing for props and function returns

---

## 7. Rendering & Performance

* **RSC by default**
* Minimize usage of:

  * `use client`
  * `useEffect`
  * `useState`

Client components:

* Only for browser APIs or direct user interactions
* Wrapped in `Suspense`
* Never used for data fetching

---

## 8. UI & Styling

* Shadcn UI + Tailwind CSS only
* Mobile-first responsive design
* No inline styles
* Framer Motion — only for meaningful, intentional animations

---

## 9. State & Navigation

* URL state → `nuqs`
* Local UI state → inside feature scope
* Avoid global state unless clearl
