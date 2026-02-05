import { db, ensureDbInitialized } from "@/shared/lib/storage/db";

/**
 * Removes old mock transactions and categories with hardcoded IDs.
 * This is a one-time cleanup for development databases.
 */
export async function cleanupOldMockData(): Promise<void> {
  await ensureDbInitialized();

  // Old mock category IDs that need to be removed
  const oldMockCategoryIds = [
    "cat_food",
    "cat_transport",
    "cat_home",
    "cat_salary",
  ];

  // Old mock transaction IDs
  const oldMockTransactionIds = [
    "tx_001",
    "tx_002",
    "tx_003",
    "tx_004",
  ];

  await db.transaction("rw", [db.categories, db.transactions], async () => {
    // Remove old mock categories
    await db.categories.bulkDelete(oldMockCategoryIds);
    
    // Remove old mock transactions
    await db.transactions.bulkDelete(oldMockTransactionIds);
    
    // Also remove any transactions referencing old category IDs
    const orphanedTxs = await db.transactions
      .filter(tx => oldMockCategoryIds.includes(tx.categoryId ?? ""))
      .toArray();
    
    if (orphanedTxs.length > 0) {
      await db.transactions.bulkDelete(orphanedTxs.map(tx => tx.id));
    }
  });

  console.log("[cleanup] Removed old mock data");
}
