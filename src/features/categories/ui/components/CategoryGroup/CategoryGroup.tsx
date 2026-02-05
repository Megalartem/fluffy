import { AnimatePresence } from "framer-motion";
import { AnimatedCategoryItem } from "../../molecules";
import type { Category } from "@/features/categories/model/types";
import styles from "./CategoryGroup.module.css";

export interface CategoryGroupProps {
  title?: string;
  categories: Category[];
  visibleIds: Set<string>;
  onEdit?: (category: Category) => void;
  onArchive?: (category: Category, isArchived: boolean) => void;
  onClick?: (category: Category) => void;
}

export function CategoryGroup({
  title,
  categories,
  visibleIds,
  onEdit,
  onArchive,
  onClick,
}: CategoryGroupProps) {
  const visibleCategories = categories.filter(c => visibleIds.has(c.id));
  
  if (visibleCategories.length === 0) return null;
  
  return (
    <div className={styles.group}>
      {title && <div className={styles.groupTitle}>{title}</div>}
      <div className={styles.groupList}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleCategories.map((category) => (
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
    </div>
  );
}
