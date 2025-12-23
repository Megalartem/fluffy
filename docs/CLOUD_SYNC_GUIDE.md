# Cloud Sync Guide

## Overview

Fluffy supports cloud synchronization to keep your financial data in sync across multiple devices. This guide covers setup, configuration, and troubleshooting for cloud sync.

## Supported Providers

### Firebase (Ready)
- **Status**: Adapter implemented, TODOs for full integration
- **Features**: Firestore database, Cloud Storage, Authentication
- **Cost**: Free tier available, scales with usage
- **Setup Time**: ~15 minutes

### Supabase (Planned)
- **Status**: Planned for future implementation
- **Features**: PostgreSQL database, Storage, Authentication
- **Cost**: Generous free tier
- **Setup Time**: ~20 minutes

## Getting Started with Firebase

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "fluffy-sync")
4. (Optional) Enable Google Analytics
5. Click "Create project"

### 2. Enable Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. Choose production mode or test mode:
   - **Production mode**: Requires security rules (recommended)
   - **Test mode**: Open for 30 days (development only)
4. Select Firestore location (closest to your users)
5. Click "Enable"

### 3. Configure Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Workspace-level access control
    match /workspaces/{workspaceId} {
      // Only authenticated users can read/write their own workspace
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Budgets collection
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Settings collection
    match /settings/{settingId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Enable Authentication

1. Navigate to **Authentication** in Firebase Console
2. Click "Get started"
3. Enable sign-in providers:
   - **Email/Password**: Basic authentication
   - **Google**: OAuth sign-in
   - (Optional) GitHub, Apple, etc.

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click "Web" (</>)
4. Register app with nickname (e.g., "Fluffy Web")
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fluffy-sync.firebaseapp.com",
  projectId: "fluffy-sync",
  storageBucket: "fluffy-sync.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 6. Configure Environment Variables

Create `.env.local` in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_CLOUD_PROVIDER=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fluffy-sync.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fluffy-sync
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fluffy-sync.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Sync Configuration
NEXT_PUBLIC_CLOUD_AUTO_SYNC=true
NEXT_PUBLIC_CLOUD_SYNC_INTERVAL=300000  # 5 minutes in ms
```

### 7. Install Firebase SDK

```bash
npm install firebase
```

### 8. Complete Firebase Integration

Replace the TODO comments in `src/core/cloud/firebase-adapter.ts` with actual Firebase calls:

```typescript
import { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch,
  query,
  where,
  orderBy,
  getDocs 
} from 'firebase/firestore';

// In push() method:
const db = getFirestore();
const batch = writeBatch(db);

for (const change of changes) {
  const docRef = doc(db, change.entityType + 's', change.entity.id);
  batch.set(docRef, {
    ...change.entity,
    syncStatus: 'synced',
    lastSyncedAt: Date.now(),
    syncedBy: this.provider.name,
  }, { merge: true });
}

await batch.commit();
```

## Using Cloud Sync

### Initial Setup

1. **Create Account**: Sign up using email/password or Google
2. **Verify Email**: Check inbox for verification email (if enabled)
3. **Enable Sync**: Navigate to Settings → Sync
4. **Choose Provider**: Select Firebase (or Supabase when available)
5. **Sign In**: Authenticate with your provider

### Syncing Data

#### Automatic Sync
- Runs every 5 minutes by default (configurable)
- Triggers immediately when coming online
- Pushes local changes, pulls remote changes

#### Manual Sync
- Click the sync status badge in the top-right corner
- Or use the sync button in Settings

#### What Gets Synced
- ✅ Transactions
- ✅ Budgets
- ✅ Categories
- ✅ Goals
- ✅ Settings (workspace-level)

### Sync Modes

#### Full Sync
- Syncs all data from the beginning
- Used for initial sync
- Takes longer but ensures consistency

#### Delta Sync (Incremental)
- Only syncs changes since last sync
- Much faster for subsequent syncs
- Uses `lastSyncedAt` timestamp

### Conflict Resolution

When the same data is modified on multiple devices, conflicts may occur.

#### Conflict Strategies

1. **Last Write Wins** (Default)
   - Uses the most recently updated version
   - Based on `updatedAt` timestamp
   - Simple and automatic

2. **Keep Local**
   - Keeps your local changes
   - Discards remote changes
   - Use when you're sure local is correct

3. **Keep Remote**
   - Keeps remote changes
   - Discards your local changes
   - Use to reset to server state

4. **Merge Changes**
   - Combines local and remote changes
   - Field-by-field merge
   - Increments version number

#### Resolving Conflicts

When conflicts are detected:
1. A badge appears on the sync status indicator
2. Click the badge to open the conflict resolver
3. Review conflicting fields (local vs remote)
4. Choose a resolution strategy
5. Click "Resolve Conflicts"

## Monitoring Sync Status

### Sync Status Badge

Located in the top-right corner of the app:

- **🟢 Synced**: All changes synchronized
- **🔵 Syncing**: Sync in progress
- **🟡 Conflict**: Conflicts detected
- **🔴 Error**: Sync failed
- **⚪ Idle**: Offline or no changes

### Sync Progress Panel

View detailed sync information:
- Current sync status
- Offline mode indicator
- Queued operations count
- Last sync timestamp
- Progress bar (when syncing)

## Offline Mode

### How It Works

1. **Detect Offline**: Network status is monitored
2. **Queue Operations**: Changes are queued locally
3. **Show Indicator**: Offline badge appears
4. **Wait for Online**: App continues working normally
5. **Auto-Drain Queue**: When online, queued operations are processed
6. **Sync**: Full sync runs after queue is drained

### Viewing Queued Operations

```typescript
const { syncState } = useSyncStatus();

console.log('Pending changes:', syncState.pendingChanges);
console.log('Failed changes:', syncState.failedChanges);
```

## Troubleshooting

### Sync Not Working

**Problem**: Sync status shows "Error"

**Solutions**:
1. Check internet connection
2. Verify Firebase credentials in `.env.local`
3. Check Firestore security rules
4. Open browser DevTools → Console for errors
5. Try manual sync from Settings

### Authentication Errors

**Problem**: "Auth failed" or "Unauthorized"

**Solutions**:
1. Sign out and sign back in
2. Check Firebase Auth is enabled
3. Verify email is verified (if required)
4. Check API key is correct

### Conflicts Keep Appearing

**Problem**: Same conflicts repeatedly

**Solutions**:
1. Use "Keep Remote" to reset local state
2. Check system time is correct on all devices
3. Ensure app version is up-to-date on all devices
4. Contact support if persistent

### Slow Sync

**Problem**: Sync takes too long

**Solutions**:
1. Check internet speed
2. Reduce sync interval in settings
3. Clear old soft-deleted data (Settings → Storage)
4. Check Firestore quota usage

### Data Not Appearing

**Problem**: Data synced but not visible

**Solutions**:
1. Check workspace ID is correct
2. Refresh the page
3. Check Firestore Console for data
4. Clear browser cache and IndexedDB

## Advanced Configuration

### Custom Sync Interval

Adjust sync frequency in `.env.local`:

```bash
# Sync every 2 minutes
NEXT_PUBLIC_CLOUD_SYNC_INTERVAL=120000

# Sync every 10 minutes
NEXT_PUBLIC_CLOUD_SYNC_INTERVAL=600000
```

### Disable Auto-Sync

```bash
NEXT_PUBLIC_CLOUD_AUTO_SYNC=false
```

Users can manually trigger sync from Settings.

### Conflict Strategy

Set default conflict strategy:

```typescript
import { SyncEngine } from '@/core/sync';

const engine = new SyncEngine(clientId, adapter);
engine.setConflictStrategy('last-write-wins'); // or 'local', 'remote', 'merge'
```

### Custom Sync Adapter

Create your own adapter for custom backends:

```typescript
import { BaseSyncAdapter } from '@/core/sync/sync-adapter';

class CustomSyncAdapter extends BaseSyncAdapter {
  async push(changes: Change[]): Promise<SyncResult> {
    // Your implementation
  }

  async pull(): Promise<Change[]> {
    // Your implementation
  }

  async pullSince(since: number): Promise<Change[]> {
    // Your implementation
  }

  async resolveConflict(conflicts, strategy): Promise<void> {
    // Your implementation
  }
}
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use `.env.example` for templates
- Rotate API keys periodically

### 2. Security Rules
- Always use production mode in Firestore
- Implement workspace-level access control
- Validate data on server side

### 3. Authentication
- Enable email verification
- Use strong password requirements
- Implement rate limiting (Firebase Auth does this)

### 4. Data Encryption
- Use HTTPS for all connections (automatic)
- Consider client-side encryption for sensitive data (future)

## Performance Tips

### 1. Optimize Sync Frequency
- Don't sync more often than needed
- Use delta sync (automatic)
- Batch operations

### 2. Database Indexing
- Firestore automatically indexes common fields
- Create composite indexes for complex queries

### 3. Reduce Payload Size
- Only sync changed fields (future enhancement)
- Compress large text fields
- Archive old transactions

### 4. Monitor Quota
- Firebase free tier: 50K reads/day, 20K writes/day
- Monitor usage in Firebase Console
- Set up billing alerts

## Migration Guide

### From Local-Only to Cloud Sync

1. **Backup Data**: Export to JSON from Settings
2. **Enable Sync**: Follow setup guide above
3. **Initial Sync**: May take a few minutes
4. **Verify**: Check all data appears in cloud

### From Firebase to Supabase

1. **Export from Firebase**: Download all Firestore data
2. **Setup Supabase**: Follow Supabase guide
3. **Import to Supabase**: Use migration script (future)
4. **Update Config**: Change provider to 'supabase'
5. **Initial Sync**: Verify all data

## FAQ

**Q: Do I need cloud sync?**  
A: No, Fluffy works fully offline. Cloud sync is optional for multi-device access.

**Q: Is my data secure?**  
A: Yes, connections use HTTPS. Data is stored securely in Firestore with access control.

**Q: Can I use multiple devices?**  
A: Yes, sync keeps data consistent across all devices.

**Q: What if I delete data by mistake?**  
A: Soft-deleted data is retained for 90 days. Contact support for recovery.

**Q: How much does Firebase cost?**  
A: Free tier covers most personal use. See [Firebase Pricing](https://firebase.google.com/pricing).

**Q: Can I self-host?**  
A: Supabase support (planned) allows self-hosting.

## Support

- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Issues**: [GitHub Issues](https://github.com/Megalartem/fluffy/issues)
- **Discord**: Coming soon

---

**Last Updated**: December 2025  
**Version**: Phase 4 Complete
