"use client";

import { ContributeGoalSheet, GoalUpsertSheet } from "@/features/goals/ui/components";
import { GoalContributionItem, GoalItem } from "@/features/goals/ui/molecules";
import { ButtonBase, GoalProgressRing, IconButton } from "@/shared/ui/atoms";
import { ActionMenu, ActionMenuItem, Card } from "@/shared/ui/molecules";
import { PageHeader } from "@/shared/ui/molecules/PageHeader/PageHeader";
import { Archive, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";


export default function TestUIGoalsPage() {
    const [isOpenGoalSheet, setIsOpenGoalSheet] = useState(false);
    const [isOpenContributionSheet, setIsOpenContributionSheet] = useState(false);

    const goalActions: ActionMenuItem[] = [
        {
            id: "edit",
            icon: Pencil,
            label: "Edit",
            onAction: () => {
                setIsOpenGoalSheet(true);
            },
        },
        {
            id: "archive",
            icon: Archive,
            label: "Archive",
            onAction: () => {
                console.log("Archive goal");
            },
        },
        {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "danger",
            onAction: () => {
                console.log("Delete goal");
            },
        },
    ];

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

            <PageHeader
                title="Goals Test Page"
                left={<IconButton
                    icon={ArrowLeft}
                    variant="ghost"
                    onClick={() => { }}
                />
                }
                right={<ActionMenu items={goalActions} />}
            />


            <GoalItem
                goal={goal2}
                subtitle="For work and gaming"
                direction="column"
                size="xl"
            />
            <ButtonBase
                variant="muted"
                onClick={() => {
                    setIsOpenGoalSheet(true);
                }}>
                Contribute
            </ButtonBase>
            <ButtonBase
                variant="default"
                onClick={() => {
                    setIsOpenGoalSheet(true);
                }}>
                Contribute
            </ButtonBase>

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
                            onClick={() => {
                                setIsOpenContributionSheet(true);
                            }}
                            onEdit={() => {
                                setIsOpenContributionSheet(true);
                            }}
                            onDelete={() => {
                                console.log("Delete contribution", contribution.id);
                            }}
                        />
                    ))}
                </div>
            </Card>

            <GoalUpsertSheet
                open={isOpenGoalSheet}
                onClose={() => setIsOpenGoalSheet(false)}
                goal={goal2}
                onCreate={(input) => {
                    console.log("Create goal", input);
                }}
                onUpdate={(input) => {
                    console.log("Update goal", input);
                }}
            />

            <ContributeGoalSheet
                goal={goal1}
                contribution={contributionArray[0]}
                open={isOpenContributionSheet}
                onClose={() => setIsOpenContributionSheet(false)}
                onCreate={(input) => {
                    console.log("Create contribution", input);
                } }
                onUpdate={(input) => {
                    console.log("Update contribution", input);
                } }
                onDelete={(input) => {
                    console.log("Delete contribution", input);
                } }
                />
        </div>
    );
}