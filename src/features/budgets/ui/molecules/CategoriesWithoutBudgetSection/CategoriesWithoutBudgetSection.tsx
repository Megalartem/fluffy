"use client";

import React, { Suspense, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { ListRowBase } from "@/shared/ui/molecules";
import { CategoryIcon, Icon, Text } from "@/shared/ui/atoms";
import { shownAmount } from "@/shared/lib/money/helper";
import type { CurrencyCode } from "@/shared/lib/money/helper";
import { getLazyLucideIcon } from "@/shared/lib/renderCategoryIcon";
import type { Category } from "@/features/categories/model/types";

import styles from "./CategoriesWithoutBudgetSection.module.css";

export interface UnbudgetedItem {
    category: Category;
    spentMinor: number;
}

export interface CategoriesWithoutBudgetSectionProps {
    items: UnbudgetedItem[];
    currency: CurrencyCode;
    onSetBudget: (categoryId: string) => void;
}

export function CategoriesWithoutBudgetSection({
    items,
    currency,
    onSetBudget,
}: CategoriesWithoutBudgetSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (items.length === 0) return null;

    return (
        <div className={styles.root}>
            <button
                type="button"
                className={styles.header}
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
            >
                <div className={styles.headerLeft}>
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ display: "flex" }}
                    >
                        <ChevronRight size={16} className={styles.chevron} />
                    </motion.div>
                    <Text variant="label">Outside budgets</Text>
                </div>
                <Text variant="caption" className={styles.count}>
                    {items.length}
                </Text>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className={styles.list}>
                            {items.map(({ category, spentMinor }) => {
                                const IconComponent = getLazyLucideIcon(category.iconKey);
                                return (
                                    <ListRowBase
                                        key={category.id}
                                        onClick={() => onSetBudget(category.id)}
                                        leading={
                                            <Suspense fallback={<div className={styles.iconPlaceholder} />}>
                                                <CategoryIcon
                                                    icon={IconComponent}
                                                    color={category.colorKey}
                                                    size="m"
                                                />
                                            </Suspense>
                                        }
                                        title={<Text variant="body">{category.name}</Text>}
                                        subtitle={
                                            <Text variant="caption">
                                                Spent: {shownAmount(spentMinor, currency)}
                                            </Text>
                                        }
                                        trailing={
                                            <Icon
                                                icon={Plus}
                                                size="m"
                                                variant="muted"
                                                className={styles.addIcon}
                                            />
                                        }
                                        size="m"
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.spacer} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

CategoriesWithoutBudgetSection.displayName = "CategoriesWithoutBudgetSection";
