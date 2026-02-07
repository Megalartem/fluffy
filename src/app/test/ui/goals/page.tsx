"use client";

import { GoalItem } from "@/features/goals/ui/molecules";
import { GoalProgressRing } from "@/shared/ui/atoms";
import { FAB } from "@/shared/ui/atoms";
import { Plus } from "lucide-react";
import { useState } from "react";


export default function TestUIGoalsPage() {

    const goal1 = {
        id: "1",
        name: "New Laptop",
        currentAmountMinor: 45000,
        targetAmountMinor: 100000,
        currency: "USD",
        deadline: "2024-12-31",
        status: "active" as const,
        workspaceId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const goal2 = {
        id: "2",
        name: "Vacation Fund",
        currentAmountMinor: 50000,
        targetAmountMinor: 50000,
        currency: "USD",
        deadline: "2024-06-30",
        status: "completed" as const,
        workspaceId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Goals</div>
            </div>

            <GoalProgressRing value={0.35} label="35%" size="s" />
            <GoalProgressRing value={0.35} label="35%" size="m" />
            <GoalProgressRing value={0.35} label="35%" size="l" />
            <GoalProgressRing value={0.67} label="67%" size="xl" />
            <GoalProgressRing value={0.35} label="35%" size="xxl" />

            <GoalItem
                goal={goal1}
                subtitle="For work and gaming"
                size="m"
            />
            <GoalItem
                goal={goal2}
                subtitle="For work and gaming"
                size="l"
            />
            <GoalItem
                goal={goal2}
                subtitle="For work and gaming"
                direction="column"
                size="xl"
            />
            <GoalItem
                goal={goal2}
                subtitle="For work and gaming"
                size="m"
            />



            {/* <FAB
                aria-label="Create Goal"
                icon={Plus}
                onClick={() => {}}
            /> */}
        </div>
    );
}
