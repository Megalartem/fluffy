import React, { Suspense, lazy } from "react";
import { dynamicIconImports, IconName } from "lucide-react/dynamic";
import { Circle } from "lucide-react";
import { CategoryIcon } from "@/shared/ui/atoms";
import { Icon } from "@/shared/ui/atoms";
import type { Category } from "@/features/categories/model/types";

// Cache for lazy-loaded icons
const lazyIconCache = new Map<IconName, React.LazyExoticComponent<React.ComponentType<{ className?: string; size?: string | number }>>>();

/**
 * Get a lazy-loaded Lucide icon component with caching
 */
export function getLazyLucideIcon(name: IconName) {
  const cached = lazyIconCache.get(name);
  if (cached) return cached;

  const importer = dynamicIconImports[name];
  if (!importer) {
    const Fallback = () => null;
    return Fallback;
  }

  const LazyIcon = lazy(importer);
  lazyIconCache.set(name, LazyIcon);
  return LazyIcon;
}

/**
 * Renders category icon for use in option lists (FormFieldSelect, CategoriesSheet, etc.)
 */
export function renderCategoryIcon(category: Category): React.ReactNode {
  return (
    <Suspense fallback={<Icon icon={Circle} size="s" />}>
      <CategoryIcon
        icon={getLazyLucideIcon(category.iconKey)}
        size="s"
        color={category.colorKey}
        importance="secondary"
      />
    </Suspense>
  );
}
