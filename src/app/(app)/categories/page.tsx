"use client";

import { useState, useCallback } from "react";

import { CategoryUpsertSheet, CategoryList, CategoriesFilter } from "@/features/categories/ui/components";
import { useCategoryMutation } from "@/features/categories/hooks/useCategoryMutation";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { FAB } from "@/shared/ui/atoms";
import { ConfirmDialog } from "@/shared/ui/molecules";
import type { Category } from "@/features/categories/model/types";
import type { CategoriesFilterValues } from "@/features/categories/model/filter-types";
import { Plus } from "lucide-react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { transactionsRepo } from "@/features/transactions/api/repo.dexie";

export default function CategoriesPage() {
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [deletingCategory, setDeletingCategory] = useState<Category | undefined>();
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [filters, setFilters] = useState<CategoriesFilterValues>({
        query: "",
        type: "all",
        showArchived: false,
    });
    const { workspaceId } = useWorkspace();
    const { items: categories, refresh } = useCategories({ includeArchived: true });
    const { catCreate, catUpdate, catArchive, catRemove } = useCategoryMutation({ refresh });

    const handleEdit = useCallback((category: Category) => {
        setEditingCategory(category);
    }, []);

    const handleArchive = useCallback(async (category: Category, isArchived: boolean) => {
        await catArchive(category.id, isArchived);
    }, [catArchive]);

    const handleDelete = useCallback(async (category: Category) => {
        const count = await transactionsRepo.countByCategory(workspaceId, category.id);
        setTransactionCount(count);
        setDeletingCategory(category);
    }, [workspaceId]);

    const confirmDelete = useCallback(async () => {
        if (deletingCategory) {
            await catRemove(deletingCategory.id);
            setDeletingCategory(undefined);
        }
    }, [deletingCategory, catRemove]);

    const handleCloseSheet = useCallback(() => {
        setEditingCategory(undefined);
    }, []);

    const handleCreate = useCallback(async (input: Parameters<typeof catCreate>[0]) => {
        await catCreate(input);
        setEditingCategory(undefined);
    }, [catCreate]);

    const handleUpdate = useCallback(async (input: { id: string; patch: Parameters<typeof catUpdate>[1] }) => {
        await catUpdate(input.id, input.patch);
        setEditingCategory(undefined);
    }, [catUpdate]);

    const handleCancelDelete = useCallback(() => {
        setDeletingCategory(undefined);
    }, []);

    const handleCreateNew = useCallback(() => {
        setEditingCategory({} as Category);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Categories</div>
            </div>

            <CategoriesFilter
                value={filters}
                onChange={setFilters}
            />

            <CategoryList
                categories={categories}
                filters={filters}
                groupByType
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
            />

            {/* Spacer for FAB */}
            <div style={{ height: "var(--spacer-height)" }} />

            {/* Category Sheet */}
            <CategoryUpsertSheet
                open={editingCategory !== undefined}
                onClose={handleCloseSheet}
                workspaceId={workspaceId}
                category={editingCategory}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <ConfirmDialog
                open={deletingCategory !== undefined}
                title="Delete category?"
                description={
                    deletingCategory
                        ? transactionCount > 0
                            ? `Category "${deletingCategory.name}" has ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}.\n\nDeleting it will remove the category from all transactions. This action cannot be undone.`
                            : `Are you sure you want to delete "${deletingCategory.name}"?\n\nThis action cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                tone="danger"
                onConfirm={confirmDelete}
                onCancel={handleCancelDelete}
            />

            <FAB
                aria-label="Create Category"
                icon={Plus}
                onClick={handleCreateNew}
            />
        </div>
    );
}
