# Fluffy

Offline-first personal finance manager on Next.js + React + TypeScript with local-first storage (Dexie / IndexedDB).

> 📚 **[Full Documentation in Wiki](./wiki/README.md)**

## Current status

**Phase:** 5 - Design System Implementation (In Progress)  
**Progress:** 40% (Phases 1-4 Complete)

- **App type:** Next.js App Router web application
- **Main domains:** `transactions`, `categories`, `goals`
- **Architecture:** See [Architecture Docs](./wiki/development/architecture.md)
- **Design System:** See [Design Foundation](./wiki/design/foundation.md)
- **ADR:** [Architecture Decision Records](./wiki/decisions/README.md)

👉 [View Current Status & Roadmap](./wiki/planning/current-status.md)

## Tech stack (actual)

- **Framework:** Next.js `16.1.0`
- **UI runtime:** React `19.2.3`, React DOM `19.2.3`
- **Language:** TypeScript `^5`
- **Storage:** Dexie `^4.2.1` (IndexedDB)
- **Styling:** Tailwind CSS `^4`
- **Animation / UI helpers:** framer-motion, dnd-kit, lucide-react, clsx
- **Linting:** ESLint `^9` + `eslint-config-next`

> Versions above are synced with `package.json`.

## Quick start

```bash
# 1) install deps
npm install

# 2) run dev server
npm run dev

# 3) open app
# http://localhost:3000
```

📖 **Detailed guide:** [Installation Documentation](./wiki/getting-started/installation.md)

## Documentation

All documentation is now organized in the [wiki](./wiki/) folder:

- 🚀 **[Getting Started](./wiki/getting-started/README.md)** - installation, project structure, first contribution
- 📦 **[Product](./wiki/product/README.md)** - vision, data model, user flows
- 🎨 **[Design](./wiki/design/README.md)** - design system, UI patterns, components
- 💻 **[Development](./wiki/development/README.md)** - architecture, patterns, testing
- 📖 **[Guides](./wiki/guides/README.md)** - cloud sync, deployment, contributing
- 🗓️ **[Planning](./wiki/planning/README.md)** - roadmap, current sprint, backlog
- 🧠 **[Decisions](./wiki/decisions/README.md)** - architecture decision records (ADR)

## Scripts

`package.json` currently defines only these scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

There are **no** `test` / `test:unit` / `test:e2e` scripts at the moment.

## Project structure

```text
src/
├── app/                  # Next.js routes (App Router)
├── core/                 # core modules (sync/offline/cloud/repositories)
├── features/
│   ├── transactions/
│   ├── categories/
│   ├── goals/
│   ├── budgets/
│   ├── dashboard/
│   ├── backup/
│   ├── settings/
│   ├── notifications/
│   └── sync/
├── shared/               # cross-cutting UI/lib/config/di
└── lib/

wiki/                     # 📚 All documentation
├── getting-started/      # Installation, project structure, first contribution
├── product/              # Product vision, data model, backlog
├── design/               # Design system, UI patterns, components
├── development/          # Architecture, offline-first patterns
├── guides/               # Cloud sync, deployment, contributing
├── planning/             # Roadmap, current status, sprints
├── decisions/            # Architecture Decision Records (ADR)
└── archive/              # Historical documentation
```

📖 **Full documentation:** [wiki/README.md](./wiki/README.md)

## Architecture notes

- Local-first data model with domain services and repository abstractions
- Domain composition root for service wiring: `src/shared/di/domain-services.ts`
- For `goals` / `transactions` relationships: [ADR-0001](./wiki/decisions/0001-goals-contributions-transactions.md)
- For category deletion semantics: [ADR-0002](./wiki/decisions/0002-categories-deletion-semantics.md)

## Contributing

Please follow [Contributing Guide](./wiki/guides/contributing.md).

---

**Need help?** Check out our [wiki](./wiki/) or ask in [GitHub Discussions](https://github.com/Megalartem/fluffy/discussions).
