"use client";

import { useState } from "react";

import { CategoryUpsertSheet, CategoryList, CategoriesFilter } from "@/features/categories/ui/components";
import { useCategoryMutation } from "@/features/categories/hooks/useCategoryMutation";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ButtonBase } from "@/shared/ui/atoms";
import type { Category } from "@/features/categories/model/types";
import type { CategoriesFilterValues } from "@/features/categories/model/filter-types";

export default function TestUICategoriesPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [filters, setFilters] = useState<CategoriesFilterValues>({
        query: "",
        type: "all",
        showArchived: false,
    });

    const { items: categories, refresh } = useCategories({ includeArchived: true });
    const { catCreate, catUpdate, catArchive } = useCategoryMutation({ refresh });

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
    };

    const handleArchive = async (category: Category, isArchived: boolean) => {
        await catArchive(category.id, isArchived);
    };

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Test UI: Categories</div>
                <ButtonBase onClick={() => setIsCreateOpen(true)}>
                    Add Category
                </ButtonBase>
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
            />

            {/* Create Category Sheet */}
            <CategoryUpsertSheet
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                workspaceId="test-workspace"
                onCreate={async (input) => {
                    await catCreate(input);
                    setIsCreateOpen(false);
                }}
                onUpdate={async () => {}}
            />

            {/* Edit Category Sheet */}
            {editingCategory && (
                <CategoryUpsertSheet
                    open={true}
                    onClose={() => setEditingCategory(undefined)}
                    workspaceId="test-workspace"
                    initial={editingCategory}
                    onCreate={async () => {}}
                    onUpdate={async (input) => {
                        await catUpdate(input.id, input.patch);
                        setEditingCategory(undefined);
                    }}
                />
            )}
        </div>
    );
}
