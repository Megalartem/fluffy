"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/workspace-context";
import type { Category } from "@/features/categories/model/types";
import { ensureDefaultCategoriesSeeded } from "@/features/categories/model/seed";
import { categoriesRepo } from "../api/repo.dexie";

type UseCategoriesOptions = {
  includeArchived?: boolean; // default: false
};

export function useCategories(options: UseCategoriesOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [items, setItems] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const didSeedRef = React.useRef(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // seed only once per workspace session
      if (!didSeedRef.current) {
        didSeedRef.current = true;
        await ensureDefaultCategoriesSeeded(workspaceId);
      }

      const list = await categoriesRepo.list(workspaceId);
      const filtered = options.includeArchived ? list : list.filter((c) => !c.isArchived);
      setItems(filtered);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, options.includeArchived]);

  React.useEffect(() => {
    // workspace changed => reseed + reload
    didSeedRef.current = false;
    void refresh();
  }, [workspaceId, refresh]);

  return { items, loading, error, refresh } as const;
}