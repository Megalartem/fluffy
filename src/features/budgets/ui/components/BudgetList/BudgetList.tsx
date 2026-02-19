"use client";

import * as React from "react";
import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import styles from "./BudgetList.module.css";

import type { CategoryBudgetSummary } from "@/features/budgets/model/types";
import { getBudgetProgress } from "@/features/budgets/model/utils";
import { BudgetItem, type BudgetItemSize, type BudgetItemDirection } from "@/features/budgets/ui/molecules";

export interface BudgetListProps {
	items: CategoryBudgetSummary[];

	size?: BudgetItemSize;
	direction?: BudgetItemDirection;
	className?: string;

	onItemClick?: (item: CategoryBudgetSummary) => void;
	onItemEdit?: (item: CategoryBudgetSummary) => void;
	onItemDelete?: (item: CategoryBudgetSummary) => void;
}

function normalizeProgress(summary: CategoryBudgetSummary): number {
	const raw = getBudgetProgress(summary);
	if (!Number.isFinite(raw)) return 0;
	return Math.max(0, raw);
}

export function BudgetList({
	items,
	size = "m",
	direction = "row",
	className,
	onItemClick,
	onItemEdit,
	onItemDelete,
}: BudgetListProps) {
	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const byProgress = normalizeProgress(b) - normalizeProgress(a);
			if (byProgress !== 0) return byProgress;
			return a.category.name.localeCompare(b.category.name);
		});
	}, [items]);

	return (
		<div className={clsx(styles.root, className)}>
			<LayoutGroup>
				<div className={styles.list}>
					<AnimatePresence initial={false} mode="popLayout">
						{sortedItems.map((item) => (
							<motion.div
								key={item.budget.id}
								layout="position"
								transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.9 }}
							>
								<BudgetItem
									budgetSummary={item}
									size={size}
									direction={direction}
									onClick={onItemClick ? () => onItemClick(item) : undefined}
									onEdit={onItemEdit ? () => onItemEdit(item) : undefined}
									onDelete={onItemDelete ? () => onItemDelete(item) : undefined}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</LayoutGroup>
			<div className={styles.spacer} />
		</div>
	);
}

export default BudgetList;
