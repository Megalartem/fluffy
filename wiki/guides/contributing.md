# Contributing to Fluffy

Thank you for your interest in contributing to Fluffy! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building a welcoming community for everyone.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/fluffy.git
cd fluffy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes
- `chore/` - Maintenance tasks

**Examples**:
- `feature/add-budget-templates`
- `fix/transaction-deletion-bug`
- `docs/update-sync-guide`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add budget template feature
fix: resolve transaction sync issue
docs: update API documentation
refactor: improve sync engine performance
test: add unit tests for conflict resolver
chore: update dependencies
```

**Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:
```bash
git commit -m "feat(sync): implement delta sync with lastSyncedAt

Added pullSince() method to SyncAdapter for incremental sync.
Reduces bandwidth and improves sync performance.

Closes #123"
```

### Pull Request Process

1. **Update Your Branch**:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run Tests**:
```bash
npm test
npm run lint
npm run build
```

3. **Push to Your Fork**:
```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out the template
   - Link related issues

5. **Address Review Comments**:
   - Make requested changes
   - Push new commits
   - Respond to reviewers

6. **Squash and Merge**:
   - Maintainers will merge when approved

## Code Standards

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use type inference when obvious

**Good**:
```typescript
interface Transaction {
  id: string;
  amount: number;
  date: string;
}

function getTransaction(id: string): Transaction | null {
  // Implementation
}
```

**Bad**:
```typescript
function getTransaction(id: any): any {
  // No type safety
}
```

### React Components

- Use functional components
- Prefer Server Components (RSC) when possible
- Use Client Components only when needed
- Extract reusable logic into hooks

**Good**:
```typescript
// Server Component (default)
export default function TransactionList({ transactions }: Props) {
  return <div>{/* Render */}</div>;
}

// Client Component (when needed)
'use client';

export function TransactionSheet({ open }: Props) {
  const [data, setData] = useState();
  return <Sheet open={open}>{/* Render */}</Sheet>;
}
```

### File Organization

Follow Feature-Sliced Design structure:

```
src/
  features/
    transactions/
      api/          # Service layer
      hooks/        # React hooks
      model/        # Types, schemas
      ui/           # Components
  core/            # Business logic
  shared/          # Utilities
  ui/              # UI components
```

### Naming Conventions

- **Files**: kebab-case (`transaction-sheet.tsx`)
- **Components**: PascalCase (`TransactionSheet`)
- **Functions**: camelCase (`getTransaction`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_AMOUNT`)
- **Interfaces**: PascalCase with `I` prefix optional (`Transaction` or `ITransaction`)

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Follow mobile-first approach
- Use design system tokens

**Good**:
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-lg border p-4',
  isActive && 'bg-blue-50',
  className
)}
```

### Testing

#### Unit Tests

Test individual functions and components:

```typescript
import { describe, it, expect } from 'vitest';
import { ConflictResolver } from './conflict-resolver';

describe('ConflictResolver', () => {
  it('should resolve conflicts with last-write-wins', () => {
    const resolver = new ConflictResolver();
    const local = { id: '1', amount: 100, updatedAt: 1000 };
    const remote = { id: '1', amount: 200, updatedAt: 2000 };
    
    const conflict = resolver.detectConflicts(local, remote)[0];
    const resolved = resolver.resolve(conflict, 'last-write-wins');
    
    expect(resolved.amount).toBe(200);
  });
});
```

#### Integration Tests

Test feature workflows:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should create transaction', async () => {
  const user = userEvent.setup();
  render(<TransactionSheet open={true} />);
  
  await user.type(screen.getByLabelText('Amount'), '100');
  await user.click(screen.getByText('Save'));
  
  await waitFor(() => {
    expect(screen.getByText('Transaction created')).toBeInTheDocument();
  });
});
```

#### E2E Tests

Test critical user flows (Playwright):

```typescript
import { test, expect } from '@playwright/test';

test('create and sync transaction', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button[aria-label="Add transaction"]');
  await page.fill('input[name="amount"]', '100');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.sync-badge')).toHaveText('Synced');
});
```

### Documentation

- Document complex logic with comments
- Use JSDoc for public APIs
- Update relevant docs when changing features
- Add examples for new features

**Good**:
```typescript
/**
 * Resolves sync conflicts using the specified strategy.
 * 
 * @param conflict - The conflict to resolve
 * @param strategy - Resolution strategy (local, remote, merge, last-write-wins)
 * @returns The resolved entity
 * 
 * @example
 * const resolved = resolver.resolve(conflict, 'last-write-wins');
 */
resolve<T extends Entity>(
  conflict: Conflict<T>,
  strategy: ConflictStrategy
): T {
  // Implementation
}
```

## Areas to Contribute

### 🐛 Bug Fixes

- Check [Issues](https://github.com/Megalartem/fluffy/issues)
- Look for `bug` label
- Reproduce the issue
- Fix and add test

### ✨ Features

- Check [Issues](https://github.com/Megalartem/fluffy/issues)
- Look for `enhancement` label
- Discuss in issue before starting
- Follow architecture patterns

### 📚 Documentation

- Fix typos
- Improve clarity
- Add examples
- Update guides

### 🧪 Tests

- Increase test coverage
- Add missing tests
- Improve test quality

### ♿ Accessibility

- Add ARIA labels
- Improve keyboard navigation
- Test with screen readers

### 🌍 Internationalization

- Add translations
- Support RTL languages
- Localize date/currency formats

## Project Structure

```
fluffy/
├── src/
│   ├── app/              # Next.js App Router
│   ├── features/         # Feature modules
│   ├── core/             # Business logic
│   ├── shared/           # Shared utilities
│   └── ui/               # UI components
├── docs/                 # Documentation
├── public/               # Static assets
└── tests/                # Test files
```

See [Architecture](../development/architecture.md) for details.

## Questions?

- **Issues**: [GitHub Issues](https://github.com/Megalartem/fluffy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Megalartem/fluffy/discussions)
- **Email**: artem@fluffy.app (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to Fluffy!** 🎉
