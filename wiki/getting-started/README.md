# 🚀 Getting Started

Welcome to the Fluffy project! This guide will help you get up and running quickly.

## What is Fluffy?

Fluffy is a modern **offline-first personal finance manager** built with Next.js, React, and TypeScript. It helps users manage their finances, track transactions, create budgets, and achieve financial goals—all while working seamlessly offline.

### Key Features

- 💰 **Transaction Management** - Track income and expenses
- 🎯 **Goal Setting** - Set and monitor financial goals
- 📊 **Categories** - Organize transactions by category
- 📱 **Offline-First** - Works without internet connection
- 🔄 **Cloud Sync** - Sync data across devices (optional)
- 🎨 **Modern UI** - Clean, intuitive interface

## Quick Start

### For New Contributors

1. **[Installation](./installation.md)** - Set up the project locally (15 min)
2. **[Project Structure](./project-structure.md)** - Understand the codebase (10 min)
3. **[First Contribution](./first-contribution.md)** - Make your first PR (varies)

### For Experienced Developers

```bash
# Clone, install, and run
git clone https://github.com/YOUR_USERNAME/fluffy.git
cd fluffy
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

## Documentation Structure

### 🎯 Getting Started (You are here!)
- **[Installation](./installation.md)** - Prerequisites, setup, troubleshooting
- **[Project Structure](./project-structure.md)** - Codebase organization and architecture
- **[First Contribution](./first-contribution.md)** - Step-by-step contribution guide

### 📚 Additional Resources
- **[Product Documentation](../product/README.md)** - Product vision, user stories, requirements
- **[Design System](../design/README.md)** - UI components, design tokens, patterns
- **[Development Guides](../development/README.md)** - Advanced development topics
- **[Architecture Docs](../development/architecture.md)** - Technical architecture details
- **[Contributing Guide](../guides/contributing.md)** - Contribution guidelines and workflow

## Tech Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Database**: Dexie 4.2.1 (IndexedDB)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Linting**: ESLint 9

## Architecture Highlights

### Offline-First

Fluffy is designed to work offline by default:
- All data stored locally in IndexedDB
- Background sync when online
- Optimistic UI updates
- Conflict resolution

### Feature-Based Structure

```
src/
├── app/          # Next.js routes
├── core/         # Business logic & services
├── features/     # Feature modules (transactions, goals, etc.)
└── shared/       # Reusable components & utilities
```

### Key Concepts

- **Workspace**: Isolated environment for user data
- **Domain Services**: Business logic layer
- **Repositories**: Data access abstraction
- **Sync Engine**: Background synchronization

Learn more: [Project Structure](./project-structure.md)

## Common Tasks

### Run the Development Server
```bash
npm run dev
```

### Check for Errors
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### View the App
Open [http://localhost:3000](http://localhost:3000)

## Getting Help

### 📖 Documentation
- Browse the [wiki](../) for guides and references
- Check [Development](../development/) for technical documentation
- Review [Product](../product/) for product specs

### 🐛 Found a Bug?
- Check existing [GitHub Issues](https://github.com)
- Create a new issue with details
- Follow the issue template

### 💡 Have Questions?
- Read the [FAQ](../development/README.md) (if available)
- Search existing GitHub Discussions
- Ask in issue comments

### 🤝 Want to Contribute?
- Start with [First Contribution](./first-contribution.md)
- Pick a `good first issue`
- Follow the [Contributing Guide](../guides/contributing.md)

## What's Next?

Choose your path:

### New to the Project?
1. ✅ Read this README (you're here!)
2. 📦 Complete [Installation](./installation.md)
3. 🗺️ Explore [Project Structure](./project-structure.md)
4. 🚀 Make [First Contribution](./first-contribution.md)

### Ready to Build?
- 🏗️ Review [Architecture](../development/architecture.md)
- 📝 Check [ADRs](../decisions/README.md) for decisions
- 🎨 Browse [Design System](../design/README.md)
- 📋 Pick a task from [Backlog](../product/backlog.md)

### Want to Understand the Product?
- 📄 Read [Product Vision](../product/vision.md)
- 🎯 Review [Product Backlog](../product/backlog.md)
- 💾 Study [Data Model](../product/data-model.md)

## Community

Fluffy is an open-source project built by contributors like you!

- 🌟 Star the repository
- 🍴 Fork and contribute
- 💬 Join discussions
- 🐛 Report bugs
- 💡 Suggest features

Thank you for being part of the Fluffy community! 🎉
