# First Contribution

A step-by-step guide to making your first contribution to Fluffy.

## Welcome! 🎉

Thank you for wanting to contribute to Fluffy! This guide will walk you through the entire process, from choosing a task to getting your pull request merged.

## Prerequisites

Before you start, make sure you have:

- ✅ Installed Fluffy locally → [Installation Guide](./installation.md)
- ✅ Read the project structure → [Project Structure](./project-structure.md)
- ✅ Dev server running successfully (`npm run dev`)

## Step 1: Choose a Task

### Finding Good First Issues

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Community contributions welcome
- `documentation` - Non-code contributions
- `bug` - Bug fixes (sometimes straightforward)

**Where to look**:
1. GitHub Issues page
2. [Project Backlog](../product/backlog.md)
3. [Next Sprint Tasks](../planning/roadmap.md)

### Ask Questions First

Before starting work:
1. Comment on the issue: "I'd like to work on this"
2. Ask for clarification if needed
3. Wait for assignment/confirmation

This prevents duplicate work and ensures alignment.

## Step 2: Set Up Your Branch

### Update Your Main Branch

```bash
# Make sure you're on main
git checkout main

# Pull latest changes
git pull origin main
```

### Create a Feature Branch

Use descriptive naming conventions:

```bash
# For new features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/documentation-update
```

**Examples**:
```bash
git checkout -b feature/add-transaction-filters
git checkout -b fix/goal-calculation-error
git checkout -b docs/update-sync-guide
```

## Step 3: Make Your Changes

### Development Workflow

1. **Make small, focused changes**
   - One issue per branch
   - Keep PRs small and reviewable

2. **Test your changes**
   ```bash
   # Run dev server
   npm run dev
   
   # Test in browser
   # Open http://localhost:3000
   
   # Check for lint errors
   npm run lint
   ```

3. **Follow code style**
   - Use TypeScript types
   - Follow existing naming conventions
   - Add comments for complex logic

### Code Quality Checklist

Before committing, verify:

- [ ] Code runs without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings (or justified)
- [ ] Tested in the browser
- [ ] Follows project structure
- [ ] Added comments if needed

## Step 4: Commit Your Changes

### Write Good Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format**:
```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding tests
- `chore` - Maintenance

**Examples**:

```bash
# Simple commit
git commit -m "feat: add transaction filter by date range"

# Detailed commit
git commit -m "fix: resolve goal calculation error

The goal progress was incorrectly calculated when transactions
were deleted. Now recalculates on transaction deletion.

Closes #42"

# Documentation
git commit -m "docs: update installation guide with troubleshooting"
```

### Commit Process

```bash
# Stage your changes
git add .

# OR stage specific files
git add src/features/transactions/components/TransactionFilter.tsx

# Commit with message
git commit -m "feat: add transaction filter component"

# Push to your fork
git push origin feature/add-transaction-filters
```

## Step 5: Create a Pull Request

### Push Your Branch

```bash
git push origin your-branch-name
```

If this is your first push:
```bash
git push -u origin your-branch-name
```

### Open a PR on GitHub

1. Go to your fork on GitHub
2. Click "Compare & pull request" button
3. Fill in the PR template:

**PR Title**: Same as commit message format
```
feat: add transaction filter by date range
```

**PR Description**:
```markdown
## What does this PR do?

Adds a date range filter to the transactions page.

## Type of change

- [x] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactor

## How to test

1. Go to /transactions page
2. Click on "Filter" button
3. Select a date range
4. Verify transactions are filtered correctly

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [x] Code runs without errors
- [x] Followed code style guidelines
- [x] Tested in browser
- [x] Updated documentation (if needed)
- [x] No lint errors

## Related issues

Closes #123
```

4. Click "Create pull request"

### PR Best Practices

- **Keep it small**: <300 lines of code if possible
- **One concern**: Address one issue per PR
- **Clear description**: Explain what and why
- **Screenshots**: For UI changes, add before/after
- **Tests**: Describe how you tested
- **Link issues**: Use "Closes #123" to auto-close issues

## Step 6: Code Review Process

### What to Expect

1. **Automated checks**: CI/CD runs linting, builds
2. **Code review**: Maintainer reviews your code
3. **Feedback**: You may receive change requests
4. **Iteration**: Make updates based on feedback
5. **Approval**: Once approved, PR is merged

### Responding to Feedback

Example feedback cycle:

**Reviewer comment**:
> "Can you extract this logic into a separate function?"

**Your response**:
```bash
# Make the changes
# ... edit code ...

# Commit the changes
git add .
git commit -m "refactor: extract date filtering logic"

# Push updates
git push origin your-branch-name
```

The PR automatically updates with your new commits.

### Common Review Requests

- **Code style**: Fix formatting or naming
- **Add comments**: Clarify complex logic
- **Error handling**: Add try/catch or validation
- **Type safety**: Add/improve TypeScript types
- **Tests**: Add or update tests (when test suite exists)

## Step 7: PR Gets Merged 🎉

Once approved and merged:

1. **Delete your branch**:
   ```bash
   # Locally
   git branch -d feature/your-feature-name
   
   # Remotely (GitHub usually does this automatically)
   git push origin --delete feature/your-feature-name
   ```

2. **Update your main**:
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Celebrate**: You're now a Fluffy contributor! 🚀

## Tips for Success

### Do's ✅

- **Start small**: Pick easy issues first
- **Ask questions**: No question is too simple
- **Be patient**: Reviews take time
- **Learn from feedback**: It makes you better
- **Read existing code**: Understand patterns
- **Test thoroughly**: Catch issues early

### Don'ts ❌

- **Don't rush**: Quality over speed
- **Don't work on assigned issues**: Ask first
- **Don't submit huge PRs**: Break them down
- **Don't take feedback personally**: It's about the code
- **Don't ignore CI failures**: Fix them before review
- **Don't commit large files**: Check .gitignore

## Common Issues & Solutions

### My branch is out of date

```bash
# Update from main
git checkout main
git pull origin main

# Rebase your branch
git checkout your-branch-name
git rebase main

# Force push (if already pushed)
git push origin your-branch-name --force-with-lease
```

### I made a mistake in my commit

```bash
# Amend last commit
git add .
git commit --amend

# OR add a new fixing commit
git add .
git commit -m "fix: correct previous commit mistake"
```

### Merge conflicts

```bash
# Update main
git checkout main
git pull origin main

# Rebase your branch
git checkout your-branch-name
git rebase main

# Fix conflicts in your editor
# (VS Code has great merge conflict tools)

# After fixing conflicts
git add .
git rebase --continue

# Push
git push origin your-branch-name --force-with-lease
```

### CI checks failing

1. Check the error messages in GitHub
2. Fix the issues locally:
   ```bash
   npm run lint        # Fix lint errors
   npm run build       # Check build errors
   ```
3. Commit and push fixes

## Resources

### Documentation
- [Contributing Guide](../guides/contributing.md) - Detailed contribution guidelines
- [Architecture Guide](../development/architecture.md) - System architecture
- [Code Review Guidelines](../development/README.md) - What reviewers look for

### Getting Help
- **GitHub Issues**: Ask questions on issue threads
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Search the docs/ and wiki/ folders

### Learning Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## Example Contribution Flow

Here's a complete example:

```bash
# 1. Choose issue #42: "Add loading state to transaction list"

# 2. Create branch
git checkout main
git pull origin main
git checkout -b feature/transaction-loading-state

# 3. Make changes
# ... edit src/features/transactions/components/TransactionList.tsx ...
# ... add loading spinner ...

# 4. Test
npm run dev
# ... test in browser ...
npm run lint

# 5. Commit
git add src/features/transactions/components/TransactionList.tsx
git commit -m "feat(transactions): add loading state to transaction list

Shows a spinner while transactions are being loaded from IndexedDB.
Improves user experience on slow devices.

Closes #42"

# 6. Push
git push -u origin feature/transaction-loading-state

# 7. Create PR on GitHub
# ... fill in PR template ...

# 8. Respond to review
# ... make requested changes ...
git add .
git commit -m "refactor: use shared loading component"
git push origin feature/transaction-loading-state

# 9. PR merged! 🎉
git checkout main
git pull origin main
git branch -d feature/transaction-loading-state
```

## What's Next?

After your first contribution:

1. **Pick another issue**: Build momentum
2. **Review others' PRs**: Learn from peers
3. **Deep dive into architecture**: [Architecture docs](../development/architecture.md)
4. **Join discussions**: Participate in planning
5. **Help newcomers**: Pay it forward

Welcome to the Fluffy community! 🚀
