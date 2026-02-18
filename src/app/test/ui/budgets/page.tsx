"use client";
import React from "react";
import { Icon, ProgressRing } from "@/shared/ui/atoms";
import { Home } from "lucide-react";
import { BudgetItem } from "@/features/budgets/ui/molecules";
import { Budget, CategoryBudgetSummary } from "@/features/budgets/model";
import { BudgetUpsertSheet } from "@/features/budgets/ui/components";
import { Category } from "@/features/categories/model/types";


export default function TestUIBudgetsPage() {
    const [currentBudget, setCurrentBudget] = React.useState<Budget | null>(null);


    const category: Category = {
        "id": "cat_528a6611-c4fe-4925-a990-0c565587b043",
        "workspaceId": "ws_local",
        "name": "Еда",
        "type": "expense",
        "iconKey": "coffee",
        "colorKey": "indigo",
        "isArchived": false,
        "order": 9,
        "createdAt": "2026-01-20T05:17:08.335Z",
        "updatedAt": "2026-02-16T05:49:53.987Z",
        "deletedAt": null
    };

    const category2: Category = {
        "id": "cat_fb482cc9-2018-4614-84cd-b1828bf0aaf5",
        "workspaceId": "ws_local",
        "name": "Транспорт",
        "type": "expense",
        "iconKey": "truck",
        "colorKey": "mint",
        "isArchived": false,
        "order": 13,
        "createdAt": "2026-01-20T05:17:08.335Z",
        "updatedAt": "2026-02-16T05:49:53.987Z",
        "deletedAt": null
    }

    const category3: Category = {
        "id": "cat_b0fe0325-30d1-46cb-ae7d-a04b1b8f2978",
        "workspaceId": "ws_local",
        "name": "Развлечения",
        "type": "expense",
        "iconKey": "film",
        "colorKey": "teal",
        "isArchived": false,
        "order": 15,
        "createdAt": "2026-01-20T05:17:08.335Z",
        "updatedAt": "2026-02-16T05:49:53.988Z",
        "deletedAt": null
    }

    const budget: Budget = {
        id: "1",
        workspaceId: "",
        categoryId: "cat_528a6611-c4fe-4925-a990-0c565587b043",
        period: "monthly",
        currency: "USD",
        limitMinor: 10000,
        createdAt: "",
        updatedAt: ""
    };

    const budget2: Budget = {
        id: "2",
        workspaceId: "",
        categoryId: "cat_fb482cc9-2018-4614-84cd-b1828bf0aaf5",
        period: "monthly",
        currency: "USD",
        limitMinor: 15000,
        createdAt: "",
        updatedAt: ""
    };

    const budget3: Budget = {
        id: "3",
        workspaceId: "",
        categoryId: "cat_b0fe0325-30d1-46cb-ae7d-a04b1b8f2978",
        period: "monthly",
        currency: "USD",
        limitMinor: 20000,
        createdAt: "",
        updatedAt: ""
    };

    const budgetSummary: CategoryBudgetSummary = {
        budget: budget,
        category: category,
        spentMinor: 4500,
    }

    const budgetSummary2: CategoryBudgetSummary = {
        budget: budget2,
        category: category2,
        spentMinor: 8000,
    }

    const budgetSummary3: CategoryBudgetSummary = {
        budget: budget3,
        category: category3,
        spentMinor: 16000,
    }

    return (
        <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Categories</div>
            </div>
            <ProgressRing
                size={"l"}
                value={0.75}
                color={"blue"}
            >
                <Icon
                    icon={Home}
                    size="l"
                />
            </ProgressRing>

            <BudgetItem
                budgetSummary={budgetSummary}
                size="m"
                onClick={() => setCurrentBudget(budgetSummary.budget)}
                onEdit={() => setCurrentBudget(budgetSummary.budget)}
            />
            <BudgetItem
                budgetSummary={budgetSummary2}
                size="m"
                onClick={() => setCurrentBudget(budgetSummary2.budget)}
                onEdit={() => setCurrentBudget(budgetSummary2.budget)}
            />

            <BudgetItem
                budgetSummary={budgetSummary3}
                size="m"
                onClick={() => setCurrentBudget(budgetSummary3.budget)}
                onEdit={() => setCurrentBudget(budgetSummary3.budget)}
            />

            {currentBudget && (
                <BudgetUpsertSheet
                    open={currentBudget !== null}
                    budget={currentBudget}
                    onClose={() => setCurrentBudget(null)}
                    onCreate={() => { }}
                    onUpdate={() => { }}
                />
            )}
        </div>
    );
}