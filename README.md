# Fluffy

Offline-first personal finance manager on Next.js + React + TypeScript with local-first storage (Dexie / IndexedDB).

## Current status

- **App type:** Next.js App Router web application.
- **Main domains:** `transactions`, `categories`, `goals`.
- **Architecture work:** P0/P1/P2 review steps are documented in `docs/ARCHITECTURE_AND_CODE_REVIEW.md`.
- **Architecture decisions (ADR):** `docs/adr/*`.

## Tech stack (actual)

- **Framework:** Next.js `16.1.0`
- **UI runtime:** React `19.2.3`, React DOM `19.2.3`
- **Language:** TypeScript `^5`
- **Storage:** Dexie `^4.2.1` (IndexedDB)
- **Styling:** Tailwind CSS `^4`
- **Animation / UI helpers:** framer-motion, dnd-kit, lucide-react, clsx
- **Linting:** ESLint `^9` + `eslint-config-next`

> Versions above are synced with `package.json`.

## Scripts

`package.json` currently defines only these scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

There are **no** `test` / `test:unit` / `test:e2e` scripts at the moment.

## Quick start

```bash
# 1) install deps
npm install

# 2) run dev server
npm run dev

# 3) open app
# http://localhost:3000
```

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

docs/
├── ARCHITECTURE.md
├── ARCHITECTURE_AND_CODE_REVIEW.md
├── OFFLINE_FIRST_PATTERNS.md
├── CLOUD_SYNC_GUIDE.md
└── adr/
```

## Architecture notes (current)

- Local-first data model with domain services and repository abstractions.
- Domain composition root for service wiring is in:
  - `src/shared/di/domain-services.ts`.
- For `goals` / `transactions` relationships and consistency trade-offs see:
  - `docs/adr/0001-goals-contributions-transactions.md`.
- For category deletion semantics see:
  - `docs/adr/0002-categories-deletion-semantics.md`.

## Documentation index

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Architecture & Code Review](./docs/ARCHITECTURE_AND_CODE_REVIEW.md)
- [ADR index](./docs/adr/README.md)
- [Offline-first patterns](./docs/OFFLINE_FIRST_PATTERNS.md)
- [Cloud sync guide](./docs/CLOUD_SYNC_GUIDE.md)
- [Deployment guide](./docs/DEPLOYMENT.md)
- [Contributing](./docs/CONTRIBUTING.md)

## Environment

Optional cloud/sync related environment variables are documented in:
- `docs/CLOUD_SYNC_GUIDE.md`
- `docs/DEPLOYMENT.md`

## Contributing

Please follow [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

---

If you want, next step I can also align `docs/ARCHITECTURE.md` with the same level of factual accuracy as this README (scripts, versions, and current DI/service wiring).
