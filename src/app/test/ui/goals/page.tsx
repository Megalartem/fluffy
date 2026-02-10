"use client";

import { GoalContributionItem, GoalItem } from "@/features/goals/ui/molecules";
import { GoalProgressRing } from "@/shared/ui/atoms";
import { Card } from "@/shared/ui/molecules";
import { PageHeader } from "@/shared/ui/molecules/PageHeader/PageHeader";


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

    const goal3 = {
        id: "3",
        name: "Emergency Fund",
        currentAmountMinor: 20000,
        targetAmountMinor: 100000,
        currency: "USD",
        deadline: "2025-01-31",
        status: "archived" as const,
        workspaceId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    const contributionArray = [
        {
            id: "1",
            amountMinor: 5000,
            currency: "USD",
            dateKey: "2024-04-01",
            note: "Initial contribution",
            goalId: "1",
            workspaceId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "2",
            amountMinor: 10000,
            currency: "USD",
            dateKey: "2024-05-01",
            note: "Second contribution",
            goalId: "1",
            workspaceId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "3",
            amountMinor: 15000,
            currency: "USD",
            dateKey: "2024-06-01",
            note: "Third contribution",
            goalId: "1",
            workspaceId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "4",
            amountMinor: 20000,
            currency: "USD",
            dateKey: "2024-07-01",
            note: "Fourth contribution",
            goalId: "1",
            workspaceId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "5",
            amountMinor: 25000,
            currency: "USD",
            dateKey: "2024-08-01",
            note: "Fifth contribution",
            goalId: "1",
            workspaceId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <PageHeader
                title="Goals Test Page"
            />

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
                goal={goal3}
                subtitle="For work and gaming"
                size="m"
            />

            <Card
            padding="m"
            bgVariant="white"
            >
                <div className="flex flex-col gap-2">
                    {contributionArray.map((contribution) => (
                        <GoalContributionItem
                            key={contribution.id}
                            tone="ghost"
                            contribution={contribution}
                            size="m"
                            onClick={() => {}}
                        />
                    ))}
                </div>
            </Card>

        </div>
    );
}
