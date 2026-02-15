"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableCategoryRow } from "../../molecules/CategoryRow/SortableCategoryRow";
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
  onDelete?: (category: Category) => void;
  onClick?: (category: Category) => void;
  
  /** Callback для изменения порядка (drag & drop) */
  onReorder?: (categoryId: string, newOrder: number) => Promise<void>;
  
  /** Enable drag & drop reordering */
  draggable?: boolean;
  
  /** Кастомный empty state */
  emptyState?: React.ReactNode;
}

export const CategoryList = React.memo(function CategoryList({
  categories,
  filters,
  groupByType = false,
  onEdit,
  onArchive,
  onDelete,
  onClick,
  onReorder,
  draggable = false,
  emptyState,
}: CategoryListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
        delay: 150, // 150ms delay to distinguish from click
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end
  const handleDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !onReorder) {
        return;
      }

      const visibleCategoriesList = filteredCategories.filter((c) =>
        visibleIds.has(c.id)
      );

      const oldIndex = visibleCategoriesList.findIndex(
        (c) => c.id === active.id
      );
      const newIndex = visibleCategoriesList.findIndex(
        (c) => c.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Reorder array
      const reordered = arrayMove(visibleCategoriesList, oldIndex, newIndex);

      // Update order for all affected categories
      await Promise.all(
        reordered.map((category, index) =>
          onReorder(category.id, index)
        )
      );
    },
    [filteredCategories, visibleIds, onReorder]
  );

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
            onDelete={onDelete}
            onClick={onClick}
            onReorder={onReorder}
            draggable={draggable}
          />
          <CategoryGroup
            title="Income"
            categories={groupedCategories.income || []}
            visibleIds={visibleIds}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
            onClick={onClick}
            onReorder={onReorder}
            draggable={draggable}
          />
        </>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredCategories
              .filter((c) => visibleIds.has(c.id))
              .map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.list}>
              <AnimatePresence initial={false} mode="popLayout">
                {filteredCategories
                  .filter((c) => visibleIds.has(c.id))
                  .map((category) => (
                    <SortableCategoryRow
                      key={category.id}
                      category={category}
                      onEdit={onEdit}
                      onArchive={onArchive}
                      onDelete={onDelete}
                      onClick={onClick}
                      draggable={draggable}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
});
