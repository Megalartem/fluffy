"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/workspace-context";
import type { CreateCategoryInput, UpdateCategoryPatch } from "@/features/categories/model/types";
import { categoryService } from "../model/service"

type UseCategoryMutationOptions = {
  refresh?: () => Promise<void> | void;
};

export function useCategoryMutation(options: UseCategoryMutationOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const withState = React.useCallback(
    async (fn: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await fn();
        await options.refresh?.();
      } catch (e) {
        setError(e);
        throw e; // чтобы UI мог показать toast/inline
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const create = React.useCallback(
    async (input: CreateCategoryInput) => {
      await withState(async () => {
        await categoryService.addCategory(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const update = React.useCallback(
    async (id: string, patch: UpdateCategoryPatch) => {
      await withState(async () => {
        await categoryService.updateCategory(workspaceId, { id, patch });
      });
    },
    [withState, workspaceId]
  );

  const archive = React.useCallback(
    async (id: string, isArchived: boolean) => {
      await withState(async () => {
        await categoryService.archiveCategory(workspaceId, id, isArchived);
      });
    },
    [withState, workspaceId]
  );

  const remove = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        await categoryService.deleteCategory(workspaceId, id);
      });
    },
    [withState, workspaceId]
  );

  return { create, update, archive, remove, loading, error } as const;
}