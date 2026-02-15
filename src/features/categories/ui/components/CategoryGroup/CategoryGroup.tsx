import { AnimatePresence } from "framer-motion";
import { memo, useCallback } from "react";
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
  onReorder?: (categoryId: string, newOrder: number) => Promise<void>;
  draggable?: boolean;
}

export const CategoryGroup = memo(function CategoryGroup({
  title,
  categories,
  visibleIds,
  onEdit,
  onArchive,
  onDelete,
  onClick,
  onReorder,
  draggable = false,
}: CategoryGroupProps) {
  const visibleCategories = categories.filter(c => visibleIds.has(c.id));
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !onReorder) {
        return;
      }

      const oldIndex = visibleCategories.findIndex((c) => c.id === active.id);
      const newIndex = visibleCategories.findIndex((c) => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Reorder array
      const reordered = arrayMove(visibleCategories, oldIndex, newIndex);

      // Update order for all affected categories
      await Promise.all(
        reordered.map((category, index) => onReorder(category.id, index))
      );
    },
    [visibleCategories, onReorder]
  );
  
  if (visibleCategories.length === 0) return null;
  
  return (
    <div className={styles.group}>
      {title && <div className={styles.groupTitle}>{title}</div>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleCategories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
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
        </SortableContext>
      </DndContext>
    </div>
  );
});
