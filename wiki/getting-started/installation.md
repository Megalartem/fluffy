# Installation

Complete guide to setting up Fluffy on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
  
- **npm**: Version 10.x or higher (comes with Node.js)
  - Check version: `npm --version`
  - OR **yarn**: Version 1.22.x or higher
  - Check version: `yarn --version`

- **Git**: For cloning the repository
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

## Clone & Install

### 1. Fork the Repository (for contributors)

If you plan to contribute, first fork the repository on GitHub:
- Go to [github.com/YOUR_ORG/fluffy](https://github.com)
- Click "Fork" button

### 2. Clone the Repository

```bash
# Clone your fork (if contributing)
git clone https://github.com/YOUR_USERNAME/fluffy.git

# OR clone the main repository (for viewing only)
git clone https://github.com/ORIGINAL_ORG/fluffy.git

cd fluffy
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 16.1.0
- React 19.2.3
- TypeScript 5.x
- Dexie 4.2.1 (IndexedDB wrapper)
- Tailwind CSS 4.x
- And other development tools

## Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Local**: [http://localhost:3000](http://localhost:3000)

You should see the Fluffy application running. The dev server supports:
- Hot Module Replacement (HMR)
- Fast Refresh for React components
- TypeScript type checking
- ESLint linting

## Environment Setup

Fluffy is **offline-first** and works without any environment configuration by default. However, for advanced features you may need:

### Optional: Cloud Sync Configuration

If you're working on cloud sync features, create a `.env.local` file:

```bash
# .env.local (create in project root)

# Cloud sync endpoint (optional)
NEXT_PUBLIC_SYNC_ENDPOINT=https://your-sync-server.com/api

# Other cloud-related variables
# See docs/CLOUD_SYNC_GUIDE.md for details
```

> **Note**: The `.env.local` file is gitignored and should never be committed.

For detailed cloud sync setup, see:
- [Cloud Sync Guide](../guides/cloud-sync.md)

## Verify Installation

### Run the Linter

```bash
npm run lint
```

Should complete without errors (warnings are okay).

### Build the Application

```bash
npm run build
```

Should complete successfully, creating an optimized production build.

### Start Production Server (optional)

```bash
npm run start
```

Runs the production build locally at [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# OR use a different port
PORT=3001 npm run dev
```

### Node Version Issues

If you encounter Node.js version errors:

```bash
# Check your Node version
node --version

# Should be 20.x or higher
# Use nvm to switch versions:
nvm install 20
nvm use 20
```

### Installation Fails

If `npm install` fails:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Restart TypeScript server (in VS Code)
# Command Palette (Cmd+Shift+P) -> "TypeScript: Restart TS Server"

# OR regenerate TypeScript cache
rm -rf .next
npm run dev
```

### IndexedDB Issues

If you encounter IndexedDB/Dexie errors:

1. Open DevTools (F12)
2. Go to Application tab
3. Clear IndexedDB storage
4. Refresh the page

### Module Not Found Errors

If you see "Module not found" errors after pulling changes:

```bash
# Reinstall dependencies
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps

Now that you have Fluffy running locally:

1. **Explore the codebase**: [Project Structure](./project-structure.md)
2. **Make your first contribution**: [First Contribution](./first-contribution.md)
3. **Read the architecture docs**: [Architecture Guide](../development/architecture.md)

## Additional Resources

- [README.md](../../README.md) - Project overview
- [CONTRIBUTING.md](../guides/contributing.md) - Contribution guidelines
- [ARCHITECTURE.md](../development/architecture.md) - Architecture details
- [Development Guides](../development/README.md) - Advanced development topics
