"use client";

import * as React from "react";
// import { useWorkspace } from "@/shared/config/workspace-context";
import type { CreateCategoryInput, UpdateCategoryPatch } from "@/features/categories/model/types";
import { getCategoryService } from "@/shared/di/domain-services"
import { useWorkspace } from "@/shared/config/WorkspaceProvider";


const categoryService = getCategoryService();

export function useCategoryMutation(params: {
  refresh?: () => Promise<void> | void;
}) {
  const { workspaceId } = useWorkspace();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const withState = React.useCallback(
    async (fn: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await fn();
        await params.refresh?.();
      } catch (e) {
        setError(e);
        throw e; // чтобы UI мог показать toast/inline
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const catCreate = React.useCallback(
    async (input: CreateCategoryInput) => {
      await withState(async () => {
        await categoryService.addCategory(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const catUpdate = React.useCallback(
    async (id: string, patch: UpdateCategoryPatch) => {
      await withState(async () => {
        await categoryService.updateCategory(workspaceId, { id, patch });
      });
    },
    [withState, workspaceId]
  );

  const catArchive = React.useCallback(
    async (id: string, isArchived: boolean) => {
      await withState(async () => {
        await categoryService.archiveCategory(workspaceId, id, isArchived);
      });
    },
    [withState, workspaceId]
  );

  const catRemove = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        await categoryService.deleteCategory(workspaceId, id);
      });
    },
    [withState, workspaceId]
  );

  return { catCreate, catUpdate, catArchive, catRemove, loading, error } as const;
}