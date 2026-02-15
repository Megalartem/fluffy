/**
 * Migration utility: Set linkedGoalId in old transactions
 * 
 * This utility migrates existing goal contribution transactions that were created
 * before the linkedGoalId field was added to the Transaction model.
 * 
 * It finds all goal contributions with linkedTransactionId and updates
 * the corresponding transactions to have linkedGoalId set.
 */

import { db } from "@/shared/lib/storage/db";

export async function migrateGoalTransactions(workspaceId: string): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // 1. Get all goal contributions for this workspace
    const allContributions = await db.goalContributions
      .where("workspaceId")
      .equals(workspaceId)
      .and((c) => c.deletedAt == null)
      .toArray();

    console.log(`Found ${allContributions.length} goal contributions to check`);

    // 2. Prepare batch updates
    const updates: Array<{ txId: string; goalId: string; contributionId: string }> = [];

    for (const contribution of allContributions) {
      if (!contribution.linkedTransactionId) {
        continue;
      }

      try {
        // Check if transaction exists
        const transaction = await db.transactions.get(contribution.linkedTransactionId);
        
        if (!transaction) {
          errors.push(
            `Transaction ${contribution.linkedTransactionId} not found for contribution ${contribution.id}`
          );
          continue;
        }

        // Check if already migrated
        if (transaction.linkedGoalId === contribution.goalId) {
          console.log(`Transaction ${transaction.id} already migrated`);
          continue;
        }

        // Add to batch update list
        updates.push({
          txId: contribution.linkedTransactionId,
          goalId: contribution.goalId,
          contributionId: contribution.id,
        });
      } catch (error) {
        const msg = `Error checking contribution ${contribution.id}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        errors.push(msg);
        console.error(msg);
      }
    }

    // 3. Execute batch updates in a single transaction
    if (updates.length > 0) {
      try {
        await db.transaction('rw', db.transactions, async () => {
          await Promise.all(
            updates.map(({ txId, goalId }) =>
              db.transactions.update(txId, { linkedGoalId: goalId })
            )
          );
        });

        migratedCount = updates.length;
        console.log(`✅ Batch migrated ${migratedCount} transactions`);
      } catch (error) {
        const msg = `Failed to execute batch update: ${
          error instanceof Error ? error.message : String(error)
        }`;
        errors.push(msg);
        console.error(msg);
      }
    }

    console.log(`✨ Migration complete: ${migratedCount} transactions migrated`);

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    };
  } catch (error) {
    const msg = `Fatal error during migration: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(msg);
    return {
      success: false,
      migratedCount,
      errors: [msg],
    };
  }
}

/**
 * Check if migration is needed
 */
export async function checkMigrationNeeded(workspaceId: string): Promise<{
  needed: boolean;
  unmigrated: number;
}> {
  try {
    const allContributions = await db.goalContributions
      .where("workspaceId")
      .equals(workspaceId)
      .and((c) => c.deletedAt == null && c.linkedTransactionId != null)
      .toArray();

    let unmigrated = 0;

    for (const contribution of allContributions) {
      if (!contribution.linkedTransactionId) continue;

      const transaction = await db.transactions.get(contribution.linkedTransactionId);
      if (transaction && transaction.linkedGoalId !== contribution.goalId) {
        unmigrated++;
      }
    }

    return {
      needed: unmigrated > 0,
      unmigrated,
    };
  } catch (error) {
    console.error("Error checking migration status:", error);
    return { needed: false, unmigrated: 0 };
  }
}
