"use client";

import * as React from "react";
import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import styles from "./BudgetList.module.css";

import type { CategoryBudgetSummary } from "@/features/budgets/model/types";
import { getBudgetProgress } from "@/features/budgets/model/utils";
import { BudgetItem, type BudgetItemSize, type BudgetItemDirection } from "@/features/budgets/ui/molecules";
import { EmptyState, Skeleton } from "@/shared/ui/molecules";

export interface BudgetListProps {
	items: CategoryBudgetSummary[];
	loading?: boolean;
	error?: unknown;

	size?: BudgetItemSize;
	direction?: BudgetItemDirection;
	className?: string;

	onItemClick?: (item: CategoryBudgetSummary) => void;
	onItemEdit?: (item: CategoryBudgetSummary) => void;
	onItemDelete?: (item: CategoryBudgetSummary) => void;
	onRetry?: () => void;
}

function normalizeProgress(summary: CategoryBudgetSummary): number {
	const raw = getBudgetProgress(summary);
	if (!Number.isFinite(raw)) return 0;
	return Math.max(0, raw);
}

export function BudgetList({
	items,
	loading = false,
	error,
	size = "m",
	direction = "row",
	className,
	onItemClick,
	onItemEdit,
	onItemDelete,
	onRetry,
}: BudgetListProps) {
	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const byProgress = normalizeProgress(b) - normalizeProgress(a);
			if (byProgress !== 0) return byProgress;
			return a.category.name.localeCompare(b.category.name);
		});
	}, [items]);

	if (error) {
		return (
			<EmptyState
				title="Failed to load budgets"
				description="Try again."
				primaryAction={onRetry ? { label: "Reload", onClick: onRetry } : undefined}
				className={clsx(styles.root, className)}
			/>
		);
	}

	if (loading) {
		return (
			<div className={clsx(styles.root, className)} aria-busy="true">
				<Skeleton variant="line" width="100%" height={24} />
				<Skeleton variant="line" width="100%" height={24} />
				<Skeleton variant="line" width="100%" height={24} />
				<Skeleton variant="line" width="100%" height={24} />
			</div>
		);
	}

	if (sortedItems.length === 0) {
		return (
			<EmptyState
				title="No budgets yet"
				description="Create your first budget to start tracking spending limits."
				className={clsx(styles.root, className)}
			/>
		);
	}

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
		</div>
	);
}

export default BudgetList;
