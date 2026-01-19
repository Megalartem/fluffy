import React, { Suspense, useMemo } from "react";
import { Circle } from "lucide-react";

import { ListRowBase } from "@/shared/ui/molecules";
import { Icon } from "@/shared/ui/atoms";
import type { CategoryColor, CategoryType } from "@/features/categories/model/types";
import { CategoryIcon } from "@/shared/ui/atoms";


export type ICategoryRow = {
  title: string;
  subtitle?: string | null;

  categoryType: CategoryType;
  isArchived?: boolean;

  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  categoryColor?: CategoryColor;

  trailing?: React.ReactNode;

  size?: "m" | "l";
  tone?: "default" | "muted" | "ghost";

  selected?: boolean;
  onClick?: () => void;
};

const TYPE_LABEL: Record<CategoryType, string> = {
  expense: "Expense",
  income: "Income",
  both: "Both",
};

function buildSubtitle(
  subtitle: string | null | undefined,
  categoryType: CategoryType,
  isArchived?: boolean
) {
  const parts: string[] = [];
  if (subtitle && subtitle.trim()) parts.push(subtitle.trim());
  parts.push(TYPE_LABEL[categoryType]);
  if (isArchived) parts.push("Archived");
  return parts.join(" • ");
}

export function CategoryRow({
  title,
  subtitle,
  categoryType,
  isArchived = false,
  icon,
  categoryColor = "default",
  trailing,
  size = "m",
  tone = "default",
  onClick,
}: ICategoryRow) {
  const computedSubtitle = useMemo(
    () => buildSubtitle(subtitle, categoryType, isArchived),
    [subtitle, categoryType, isArchived]
  );

  return (
    <ListRowBase
      leading={
        <Suspense fallback={<Icon icon={Circle} size={size === "l" ? "m" : "s"} />}>
          <CategoryIcon
            icon={icon}
            size={size === "l" ? "m" : "s"}
            color={categoryColor}
            importance="secondary"
          />
        </Suspense>
      }
      title={title}
      subtitle={computedSubtitle || undefined}
      trailing={trailing}
      size={size}
      tone={tone}
      onClick={onClick}
      ariaLabel={`Open category: ${title}`}
    />
  );
}

CategoryRow.displayName = "CategoryRow";