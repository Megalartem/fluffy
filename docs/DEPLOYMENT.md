# Deployment Guide

## Overview

This guide covers deploying Fluffy to production, including environment setup, hosting options, and monitoring.

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests passing
- [ ] No TypeScript errors (`npm run build`)
- [ ] ESLint warnings resolved
- [ ] Code reviewed and approved
- [ ] Documentation updated

### 2. Environment Configuration

- [ ] Production `.env` configured
- [ ] Firebase project created (if using sync)
- [ ] API keys secured
- [ ] CORS policies configured
- [ ] Security rules deployed

### 3. Performance

- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Database indices configured

### 4. Security

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Authentication tested
- [ ] Input validation in place
- [ ] Rate limiting configured

### 5. Monitoring

- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] Performance monitoring
- [ ] Uptime monitoring

## Environment Setup

### Production Environment Variables

Create `.env.production`:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://fluffy.app
NEXT_PUBLIC_APP_VERSION=1.0.0

# Firebase (if using cloud sync)
NEXT_PUBLIC_CLOUD_PROVIDER=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_PROD_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fluffy-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fluffy-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fluffy-prod.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_PROD_APP_ID

# Sync Configuration
NEXT_PUBLIC_CLOUD_AUTO_SYNC=true
NEXT_PUBLIC_CLOUD_SYNC_INTERVAL=300000

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Hosting Options

### Option 1: Vercel (Recommended)

**Pros**: Zero-config, automatic deployments, edge network, serverless functions

**Setup**:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Configure Environment Variables:
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Add all variables from `.env.production`

**Custom Domain**:
```bash
vercel domains add fluffy.app
```

**Auto-Deploy from Git**:
- Connect GitHub repository
- Vercel auto-deploys on push to main

### Option 2: Netlify

**Pros**: Great free tier, easy configuration, good DX

**Setup**:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Deploy:
```bash
netlify deploy --prod
```

**Build Settings** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Cloudflare Pages

**Pros**: Fast global CDN, generous free tier, DDoS protection

**Setup**:

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect GitHub repository
3. Configure build:
   - Build command: `npm run build`
   - Output directory: `out`
4. Add environment variables
5. Deploy

### Option 4: Self-Hosted (Docker)

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  fluffy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://fluffy.app
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - fluffy
    restart: unless-stopped
```

**Deploy**:
```bash
docker-compose up -d
```

## Build Optimization

### 1. Enable Static Export

**next.config.ts**:
```typescript
const nextConfig = {
  output: 'export',  // Static HTML export
  images: {
    unoptimized: true,  // Required for static export
  },
};
```

### 2. Bundle Analysis

```bash
npm install @next/bundle-analyzer
```

**next.config.ts**:
```typescript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Analyze**:
```bash
ANALYZE=true npm run build
```

### 3. Compression

Most hosts enable gzip/brotli automatically. To verify:

```bash
curl -H "Accept-Encoding: gzip" -I https://fluffy.app
```

## Firebase Setup (Cloud Sync)

### 1. Production Project

1. Create separate Firebase project for production
2. Enable Firestore in production mode
3. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### 2. Firestore Security Rules

**firestore.rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    match /budgets/{budgetId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    match /categories/{categoryId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    match /goals/{goalId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    match /settings/{settingId} {
      allow read, write: if isOwner(resource.data.userId);
    }
  }
}
```

### 3. Firestore Indices

**firestore.indexes.json**:
```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "lastSyncedAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Deploy**:
```bash
firebase deploy --only firestore:indexes
```

## Monitoring & Analytics

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

**sentry.client.config.ts**:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Web Vitals (Analytics)

**app/layout.tsx**:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Custom Logging

**src/shared/logging/logger.ts**:
```typescript
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta);
    // Send to analytics service
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to Sentry
  },
};
```

## Performance Monitoring

### Lighthouse CI

**.lighthouserc.json**:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Run**:
```bash
npm run build
npx lhci autorun
```

## Health Checks

Create health check endpoint:

**app/api/health/route.ts**:
```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}
```

**Monitor**:
```bash
curl https://fluffy.app/api/health
```

## Rollback Strategy

### Vercel

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Git-based

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Post-Deployment

### 1. Smoke Tests

- [ ] Homepage loads
- [ ] Authentication works
- [ ] Create transaction
- [ ] Sync works (if enabled)
- [ ] Offline mode works
- [ ] Mobile responsive

### 2. Monitoring

- [ ] Check error rates (Sentry)
- [ ] Monitor performance (Analytics)
- [ ] Watch database usage (Firebase Console)
- [ ] Check CDN cache hit rate

### 3. User Communication

- [ ] Announce release (if major)
- [ ] Update changelog
- [ ] Document breaking changes
- [ ] Notify beta users

## Troubleshooting

### Build Fails

**Check**:
```bash
npm run build
```

**Common Issues**:
- TypeScript errors
- Missing dependencies
- Environment variables

### Deployment Fails

**Vercel**:
```bash
vercel logs
```

**Netlify**:
```bash
netlify logs
```

### Runtime Errors

**Sentry**: Check error dashboard  
**Console**: Check browser DevTools

## Best Practices

### 1. ✅ Use Staging Environment

Deploy to staging before production:
```bash
vercel --env staging
```

### 2. ✅ Automated Deployments

Set up CI/CD pipeline:

**.github/workflows/deploy.yml**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 3. ✅ Monitor Performance

- Set up alerts for errors
- Monitor Web Vitals
- Track user engagement
- Watch bundle size

### 4. ✅ Keep Dependencies Updated

```bash
npm outdated
npm update
```

### 5. ✅ Regular Backups

- Export Firestore data weekly
- Backup user data
- Keep deployment history

## Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

---

**Last Updated**: December 2025  
**Version**: Phase 4 Complete