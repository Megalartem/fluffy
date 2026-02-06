import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Circle } from "lucide-react";
import { CategoryIcon } from "@/shared/ui/atoms";
import { Icon } from "@/shared/ui/atoms";
import type { Category } from "@/features/categories/model/types";

/**
 * Renders category icon for use in option lists (FormFieldSelect, CategoriesSheet, etc.)
 */
export function renderCategoryIcon(category: Category): React.ReactNode {
  const DynamicIcon = dynamic(dynamicIconImports[category.iconKey], {
    ssr: false,
  });

  return (
    <Suspense fallback={<Icon icon={Circle} size="s" />}>
      <CategoryIcon
        icon={DynamicIcon}
        size="s"
        color={category.colorKey}
        importance="secondary"
      />
    </Suspense>
  );
}
