import type { ITransactionsRepository } from "@/core/repositories";
import type { Transaction } from "@/features/transactions/model/types";
import { AppError } from "@/shared/errors/app-error";

interface TransactionListQuery {
  type?: "expense" | "income";
  categoryId?: string | null;
  from?: string;
  to?: string;
  limit?: number;
}

/**
 * In-Memory implementation of ITransactionsRepository for testing.
 * Stores data in a Map with optional auto-incrementing IDs.
 */
export class InMemoryTransactionsRepository implements ITransactionsRepository {
  private storage = new Map<string, Transaction>();

  async create(workspaceId: string, tx: Transaction): Promise<Transaction> {
    if (this.storage.has(tx.id)) {
      throw new AppError("CONFLICT", "Transaction already exists", { id: tx.id });
    }
    this.storage.set(tx.id, { ...tx, workspaceId });
    return this.storage.get(tx.id)!;
  }

  async list(workspaceId: string, query: TransactionListQuery = {}): Promise<Transaction[]> {
    let results = Array.from(this.storage.values()).filter(
      (t) => t.workspaceId === workspaceId && !t.deletedAt
    );

    // Apply filters
    if (query.type) {
      results = results.filter((t) => t.type === query.type);
    }
    if (query.categoryId !== undefined) {
      results = results.filter((t) => (t.categoryId ?? null) === query.categoryId);
    }
    if (query.from) {
      results = results.filter((t) => t.date >= query.from!);
    }
    if (query.to) {
      results = results.filter((t) => t.date <= query.to!);
    }

    // Sort by date desc, then createdAt desc
    results.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date < b.date ? 1 : -1;
      }
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    // Apply limit
    const limit = query.limit ?? 50;
    return results.slice(0, limit);
  }

  async listRecent(
    workspaceId: string,
    params?: { type?: "expense" | "income"; limit?: number }
  ): Promise<Transaction[]> {
    let results = Array.from(this.storage.values()).filter(
      (t) => t.workspaceId === workspaceId && !t.deletedAt
    );

    if (params?.type) {
      results = results.filter((t) => t.type === params.type);
    }

    results.sort((a, b) => {
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    const limit = params?.limit ?? 5;
    return results.slice(0, limit);
  }

  async getById(workspaceId: string, id: string): Promise<Transaction | null> {
    const tx = this.storage.get(id);
    if (!tx || tx.workspaceId !== workspaceId || tx.deletedAt) {
      return null;
    }
    return tx;
  }

  async update(workspaceId: string, id: string, patch: Partial<Transaction>): Promise<Transaction> {
    const existing = await this.getById(workspaceId, id);
    if (!existing) {
      throw new AppError("NOT_FOUND", "Transaction not found", { id });
    }

    const updated: Transaction = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.storage.set(id, updated);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    const existing = await this.getById(workspaceId, id);
    if (!existing) return;

    this.storage.set(id, {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Test utilities
  clear(): void {
    this.storage.clear();
  }

  getAll(): Transaction[] {
    return Array.from(this.storage.values());
  }
}
