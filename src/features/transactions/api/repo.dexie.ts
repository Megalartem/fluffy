import type { TransactionsRepo, TransactionListQuery } from "./repo";
import type { Transaction } from "../model/types";
import { AppError } from "@/shared/errors/app-error";
import { db, ensureDbInitialized } from "@/shared/lib/storage/db";

export class DexieTransactionsRepo implements TransactionsRepo {
  async create(workspaceId: string, tx: Transaction): Promise<Transaction> {
    try {
      await ensureDbInitialized();
      await db.transactions.put(tx);
      return tx;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to create transaction", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async list(workspaceId: string, query: TransactionListQuery = {}): Promise<Transaction[]> {
    try {
      await ensureDbInitialized();

      const limit = query.limit ?? 50;

      // Базово: выбираем по workspaceId, исключаем soft-deleted
      let coll = db.transactions
        .where("workspaceId")
        .equals(workspaceId)
        .filter((t) => !t.deletedAt);

      if (query.type) coll = coll.filter((t) => t.type === query.type);
      if (query.categoryId !== undefined) coll = coll.filter((t) => (t.categoryId ?? null) === query.categoryId);

      if (query.from && query.from !== undefined) coll = coll.filter((t) => t.date >= query.from);
      if (query.to && query.to !== undefined) coll = coll.filter((t) => t.date <= query.to);

      // Dexie: сортировка по date desc + createdAt desc вручную
      const arr = await coll.toArray();
      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.createdAt < b.createdAt ? 1 : -1;
      });

      return arr.slice(0, limit);
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to list transactions", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
