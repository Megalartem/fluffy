import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatedCategoryItem, type AnimatedCategoryItemProps } from "./AnimatedCategoryItem";
import styles from "./SortableCategoryRow.module.css";

export interface SortableCategoryRowProps extends AnimatedCategoryItemProps {
  /** Enable drag & drop */
  draggable?: boolean;
}

export function SortableCategoryRow({
  category,
  draggable = false,
  ...props
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    disabled: !draggable,
  });

  const style = React.useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : undefined,
    cursor: draggable ? 'grab' : undefined,
    zIndex: isDragging ? 1000 : undefined,
  }), [transform, transition, isDragging, draggable]);

  if (!draggable) {
    return <AnimatedCategoryItem category={category} {...props} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? styles.dragging : undefined}
      {...attributes}
      {...listeners}
    >
      <AnimatedCategoryItem 
        category={category} 
        disableLayoutAnimation={true}
        {...props} 
      />
    </div>
  );
}
