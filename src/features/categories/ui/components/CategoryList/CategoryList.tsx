"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { AnimatedCategoryItem } from "../../molecules/CategoryRow/AnimatedCategoryItem";
import { CategoryGroup } from "../CategoryGroup/CategoryGroup";
import { CategoryListEmpty } from "./CategoryListStates";
import { EmptyState } from "@/shared/ui/molecules";
import type { Category } from "@/features/categories/model/types";
import type { CategoriesFilterValues } from "@/features/categories/model/filter-types";
import styles from "./CategoryList.module.css";

export interface CategoryListProps {
  /** Список категорий */
  categories: Category[];
  
  /** Значения фильтров (внешнее управление) */
  filters?: CategoriesFilterValues;
  
  /** Группировать по типу */
  groupByType?: boolean;
  
  /** Коллбеки для действий */
  onEdit?: (category: Category) => void;
  onArchive?: (category: Category, isArchived: boolean) => void;
  onClick?: (category: Category) => void;
  
  /** Кастомный empty state */
  emptyState?: React.ReactNode;
}

export function CategoryList({
  categories,
  filters,
  groupByType = false,
  onEdit,
  onArchive,
  onClick,
  emptyState,
}: CategoryListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Фильтрация по типу и поиску
  const filteredCategories = React.useMemo(() => {
    let result = categories;

    if (!filters) return result;

    // Фильтр по типу
    if (filters.type !== "all") {
      result = result.filter((c) => c.type === filters.type);
    }

    // Поиск
    const query = filters.query.trim().toLowerCase();
    if (query) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [categories, filters]);

  // Set видимых ID (исключаем архивные если фильтр выключен)
  const visibleIds = React.useMemo(() => {
    const ids = new Set<string>();
    
    filteredCategories.forEach((category) => {
      // Показываем архивные только если включен фильтр
      if (category.isArchived && !filters?.showArchived) {
        return;
      }
      ids.add(category.id);
    });
    
    return ids;
  }, [filteredCategories, filters?.showArchived]);

  // Группировка по типу
  const groupedCategories = React.useMemo(() => {
    if (!groupByType) {
      return { all: filteredCategories };
    }

    return {
      expense: filteredCategories.filter((c) => c.type === "expense"),
      income: filteredCategories.filter((c) => c.type === "income"),
    };
  }, [filteredCategories, groupByType]);

  const hasCategories = categories.length > 0;
  const hasVisibleCategories = visibleIds.size > 0;

  if (!hasCategories) {
    return <CategoryListEmpty>{emptyState}</CategoryListEmpty>;
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {!hasVisibleCategories ? (
        <EmptyState
          title="No categories found"
          description="Try adjusting your search or filters"
        />
      ) : groupByType ? (
        <>
          <CategoryGroup
            title="Expenses"
            categories={groupedCategories.expense || []}
            visibleIds={visibleIds}
            onEdit={onEdit}
            onArchive={onArchive}
            onClick={onClick}
          />
          <CategoryGroup
            title="Income"
            categories={groupedCategories.income || []}
            visibleIds={visibleIds}
            onEdit={onEdit}
            onArchive={onArchive}
            onClick={onClick}
          />
        </>
      ) : (
        <div className={styles.list}>
          <AnimatePresence initial={false} mode="popLayout">
            {filteredCategories
              .filter(c => visibleIds.has(c.id))
              .map((category) => (
                <AnimatedCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onClick={onClick}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
