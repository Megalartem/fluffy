"use client";

import React from "react";
import { Coffee, Home, Car, Briefcase } from "lucide-react";

import { CategoryRow } from "@/features/categories/ui/molecules";
import { CategoryActionsMenu } from "@/features/categories/ui/molecules/CategoryActionsMenu/CategoryActionsMenu";

export default function TestUICategoriesPage() {
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
          trailing={
            <CategoryActionsMenu
                isArchived={false}
                onEdit={() => console.log("edit category: food")}
                onArchiveToggle={(next) => console.log("archive toggle category: food", next)}
                onDelete={() => console.log("delete category: food")}
            />
          }
        />
      </div>
    </div>
  );
}
