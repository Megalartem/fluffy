import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CategoryRow } from "./CategoryRow";
import { CategoryActionsMenu } from "../CategoryActionsMenu/CategoryActionsMenu";
import type { Category } from "@/features/categories/model/types";
import { getLazyLucideIcon } from "@/shared/lib/renderCategoryIcon";

const ANIMATION_DURATION = 0.25;
const ANIMATION_EASE = [0.4, 0, 0.2, 1] as const;

export interface AnimatedCategoryItemProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onArchive?: (category: Category, isArchived: boolean) => void;
  onDelete?: (category: Category) => void;
  onClick?: (category: Category) => void;
}

export function AnimatedCategoryItem({
  category,
  onEdit,
  onArchive,
  onDelete,
  onClick,
}: AnimatedCategoryItemProps) {
  const shouldReduceMotion = useReducedMotion();

  const animationConfig = React.useMemo(() => ({
    initial: shouldReduceMotion ? undefined : { 
      opacity: 0,
      scale: 0.95,
    },
    animate: { 
      opacity: 1,
      scale: 1,
    },
    exit: shouldReduceMotion ? undefined : { 
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
        delay: 0.3,
      }
    },
    transition: { 
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
      layout: {
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
      }
    }
  }), [shouldReduceMotion]);

  return (
    <motion.div
      layout="position"
      {...animationConfig}
      style={{
        transformOrigin: "center center",
      }}
    >
      <CategoryRow
        title={category.name}
        categoryType={category.type}
        icon={getLazyLucideIcon(category.iconKey)}
        categoryColor={category.colorKey}
        isArchived={category.isArchived}
        tone={category.isArchived ? "ghost" : "default"}
        onClick={() => onClick?.(category)}
        trailing={
          <CategoryActionsMenu
            isArchived={category.isArchived}
            onArchiveToggle={(isArchived) => onArchive?.(category, isArchived)}
            onEdit={() => onEdit?.(category)}
            onDelete={() => onDelete?.(category)}
          />
        }
      />
    </motion.div>
  );
}
