import { AnimatePresence } from "framer-motion";
import { memo } from "react";
import { SortableCategoryRow } from "../../molecules/CategoryRow/SortableCategoryRow";
import type { Category } from "@/features/categories/model/types";
import styles from "./CategoryGroup.module.css";

export interface CategoryGroupProps {
  title?: string;
  categories: Category[];
  visibleIds: Set<string>;
  onEdit?: (category: Category) => void;
  onArchive?: (category: Category, isArchived: boolean) => void;
  onDelete?: (category: Category) => void;
  onClick?: (category: Category) => void;
  draggable?: boolean;
}

/**
 * Presentation component for grouped categories.
 * Does NOT include DndContext - that should be wrapped by parent (CategoryList).
 */
export const CategoryGroup = memo(function CategoryGroup({
  title,
  categories,
  visibleIds,
  onEdit,
  onArchive,
  onDelete,
  onClick,
  draggable = false,
}: CategoryGroupProps) {
  const visibleCategories = categories.filter(c => visibleIds.has(c.id));
  
  if (visibleCategories.length === 0) return null;
  
  return (
    <div className={styles.group}>
      {title && <div className={styles.groupTitle}>{title}</div>}
      <div className={styles.groupList}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleCategories.map((category) => (
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
    </div>
  );
});
