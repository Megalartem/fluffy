"use client";

import { useCallback, useMemo, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import type { Category } from "@/features/categories/model/types";
import { ensureDefaultCategoriesSeeded } from "@/features/categories/model/seed";
import { nowIso } from "@/shared/lib/storage/db";

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function useCategories() {
  const repo = useMemo(() => new DexieCategoriesRepo(), []);
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
    await ensureDefaultCategoriesSeeded(workspaceId);
    const list = await repo.list(workspaceId);
    setItems(list);
    setLoading(false);
  }, [repo]);

  const create = useCallback(
    async (name: string) => {
      const n = name.trim();
      if (!n) return;

      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      const maxOrder = items.reduce((m, c) => Math.max(m, c.order), 0);

      const now = nowIso();
      await repo.create(workspaceId, {
        id: makeId("cat"),
        workspaceId,
        name: n,
        type: "expense",
        icon: null,
        color: null,
        isDefault: false,
        order: maxOrder + 10,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      await load();
    },
    [repo, items, load]
  );

  const rename = useCallback(
    async (categoryId: string, newName: string) => {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await repo.update(workspaceId, categoryId, { name: newName.trim() });
      await load();
    },
    [repo, load]
  );

  const remove = useCallback(
    async (categoryId: string) => {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await repo.softDelete(workspaceId, categoryId);
      await load();
    },
    [repo, load]
  );

  return {
    items,
    loading,
    load,
    create,
    rename,
    remove,
  } as const;
}
