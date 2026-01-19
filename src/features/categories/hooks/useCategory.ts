"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/workspace-context";
import type { Category } from "@/features/categories/model/types";
import { categoriesRepo } from "../api/repo.dexie";

type UseCategoryOptions = {
  fromList?: Category[];
};

export function useCategory(categoryId: string | null | undefined, options: UseCategoryOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [item, setItem] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setError(null);

    if (!categoryId) {
      setItem(null);
      return;
    }

    // fast path: find in list
    const fromList = options.fromList?.find((c) => c.id === categoryId) ?? null;
    if (fromList) {
      setItem(fromList);
      return;
    }

    setLoading(true);
    try {
      const c = await categoriesRepo.getById(workspaceId, categoryId);
      setItem(c);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [categoryId, options.fromList, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh } as const;
}