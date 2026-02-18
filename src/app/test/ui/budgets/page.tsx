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
        id: "1",
        name: "Food",
        iconKey: "coffee",
        colorKey: "red",
        workspaceId: "",
        type: "expense",
        order: 0,
        isArchived: false,
        createdAt: "",
        updatedAt: ""
    }

    const budget: Budget = {
        id: "1",
        workspaceId: "",
        categoryId: "1",
        period: "monthly",
        currency: "USD",
        limitMinor: 10000,
        createdAt: "",
        updatedAt: ""
    };

    const budgetSummary: CategoryBudgetSummary = {
        budget: budget,
        category: category,
        spentMinor: 4500,
    }

    const budgetSummary2: CategoryBudgetSummary = {
        budget: budget,
        category: { ...category, id: "2", name: "Transport", iconKey: "car", colorKey: "blue" },
        spentMinor: 8000,
    }

    const budgetSummary3: CategoryBudgetSummary = {
        budget: budget,
        category: { ...category, id: "3", name: "Entertainment", iconKey: "tv", colorKey: "green" },
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
                // onEdit={() => { }}
            />
            <BudgetItem
                budgetSummary={budgetSummary2}
                size="m"
                onClick={() => setCurrentBudget(budgetSummary2.budget)}
                // onEdit={() => { }}
            />

            <BudgetItem
                budgetSummary={budgetSummary3}
                size="m"
                onClick={() => setCurrentBudget(budgetSummary3.budget)}
                // onEdit={() => { }}
            />

            {currentBudget && (
                <BudgetUpsertSheet
                    open={currentBudget !== null}
                    budget={currentBudget}
                    onClose={() => setCurrentBudget(null)}
                    onCreate={() => {}}
                    onUpdate={() => {}}
                />
            )}
        </div>
    );
}