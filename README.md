# Fluffy - Personal Finance App

A modern, responsive personal finance management application built with Next.js, React, and TypeScript.

## Features

- 💰 Transaction tracking (income & expenses)
- 📊 Budget management with visual indicators
- 🎯 Financial goals tracking
- 📈 Dashboard with spending analysis
- 💾 Local-first storage with IndexedDB (Dexie)
- 📱 Responsive mobile-first design
- 🛡️ Fully typed with TypeScript
- 🌍 Russian localization

## Tech Stack

- **Framework:** Next.js 16.1.0
- **Runtime:** React 19.2.3
- **Language:** TypeScript 5 (strict mode)
- **Database:** IndexedDB with Dexie 4.2.1
- **Styling:** Tailwind CSS 4
- **State Management:** React Context + Custom Hooks
- **Code Quality:** ESLint 9

## Architecture

### Phase 1: Foundational Infrastructure ✅
- DI Container with singleton/transient support
- Constants & defaults layer
- WorkspaceContext for global state
- Repository abstraction (Dexie + In-Memory)

### Phase 2: Advanced State Management ✅
- MetaRegistry with caching (5-min TTL)
- AppState with 20+ actions
- React ErrorBoundary with fallback UI
- Input validators with error codes
- Logger with performance tracking

### Phase 3: Component Refactoring ✅
- TransactionSheet: 353 → 140 lines (-60%)
- 6 reusable UI components
- Design System: Button, Input, Select
- Pagination with full CRUD
- Backup/Restore with progress indicators

### Phase 4: Cloud-Sync Preparation (In Progress)
- Cloud-sync infrastructure
- Database optimization
- Final documentation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js app router
├── core/               # Business logic layer
├── features/           # Feature modules
│   ├── backup/        # Backup/restore
│   ├── budgets/       # Budget management
│   ├── categories/    # Category management
│   ├── dashboard/     # Dashboard
│   ├── goals/         # Financial goals
│   ├── notifications/ # Notifications
│   ├── settings/      # Settings
│   └── transactions/  # Transaction management
├── lib/               # Utilities
├── shared/            # Shared components & libs
│   └── ui/           # Design System components
└── workspace/         # Workspace context
```

## Key Files

- `ai_project_artifacts/REFACTORING_PHASE_1_COMPLETE.md` - Phase 1 documentation
- `ai_project_artifacts/REFACTORING_PHASE_2_COMPLETE.md` - Phase 2 documentation
- `ai_project_artifacts/REFACTORING_PHASE_3_COMPLETE.md` - Phase 3 documentation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
