"use client";

import React, { useState } from "react";
import { Coffee, ShoppingBag } from "lucide-react";

import { CategoryRow, CategoryActionsMenu, CategoryUpsertSheet } from "@/features/categories/ui/molecules";
import { useCategoryMutation } from "@/features/categories/hooks/useCategoryMutation";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryAppearance } from "@/features/categories/ui/components";
import { CategoryColor } from "@/features/categories/model/types";

export default function TestUICategoriesPage() {

    const [isArchived, setIsArchived] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [colorId, setColorId] = useState<CategoryColor>("red");
    const [icon, setIcon] = useState<React.ReactNode>(<ShoppingBag />);

    const openAllColors = () => {
        // открыть BottomSheet/Modal с полной палитрой
        console.log("open all colors sheet");
    };

    const { refresh } = useCategories();
    const { catUpdate, catArchive } = useCategoryMutation({
        refresh
    });

    const handleArchiveToggle = (next: boolean) => {
        setIsArchived(next);
        // catArchive("some-category-id", next);
    }

    const handleOpenEdit = () => {
        console.log("open edit category sheet");
        setIsEditOpen(true);
    }


    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <div className="text-lg font-semibold">Test UI: Categories</div>

            <div className="flex flex-col gap-2">
                <CategoryRow
                    title="Еда"
                    subtitle="Часто"
                    categoryType="expense"
                    icon={Coffee}
                    categoryColor="orange"
                    tone={isArchived ? "ghost" : "default"}
                    trailing={
                        <CategoryActionsMenu
                            isArchived={isArchived}
                            onEdit={handleOpenEdit}
                            onArchiveToggle={handleArchiveToggle}
                            onDelete={() => console.log("delete category: food")}
                        />
                    }
                />
            </div>

            {isEditOpen && (
                <CategoryUpsertSheet
                    open={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    workspaceId="some-workspace-id"
                    onCreate={(input) => console.log("create category", input)}
                    onUpdate={(input) => console.log("update category", input)}
                />
            )}
            <CategoryAppearance
                icon={icon}
                colorId={colorId}
                onChangeColor={setColorId}
                // onOpenIconsSheet={() => console.log("open icons sheet")}
            />

        </div>
    );
}
