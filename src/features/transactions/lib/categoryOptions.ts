import type { Category } from "@/features/categories/model/types";
import type { TransactionType } from "@/features/transactions/model/types";
import type { OptionItem } from "@/shared/ui/atoms";

export type CategoryIconRenderer = (category: Category) => React.ReactNode;

type BuildCategoryOptionsParams = {
  categories: Category[];
  txType: TransactionType;
  includeArchived?: boolean; // по умолчанию false
  renderIcon?: CategoryIconRenderer; // опционально
};

function isCategoryAllowedForTxType(categoryType: Category["type"], txType: TransactionType) {
  // transfer не должен иметь категорий
  if (txType === "transfer") return false;

  if (categoryType === "both") return true;
  return categoryType === txType; // expense/income
}

export function buildCategoryOptions({
  categories,
  txType,
  includeArchived = false,
  renderIcon,
}: BuildCategoryOptionsParams): OptionItem[] {
  return categories
    .filter((c) => (includeArchived ? true : !c.isArchived))
    .filter((c) => isCategoryAllowedForTxType(c.type, txType))
    .filter((c) => !c.deletedAt) // на всякий случай
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => ({
      value: c.id,
      label: c.name,
      ...(renderIcon ? { icon: renderIcon(c) } : {}),
    }));
}

/**
 * Convenience: найти выбранную категорию-опцию по categoryId (для edit-prefill)
 */
export function findCategoryOption(
  options: OptionItem[],
  categoryId?: string | null
): OptionItem | null {
  if (!categoryId) return null;
  return options.find((o) => o.value === categoryId) ?? null;
}