 import type { OptionBaseProps } from "@/shared/ui/atoms";

/**
 * Гарантирует single-семантику для chosenOptions (массив/nullable контракт).
 * - null/[] -> null
 * - [a, b, ...] -> [a]
 */
export function normalizeSingleChosen(
  chosen: OptionBaseProps[] | null
): OptionBaseProps[] | null {
  if (!chosen || chosen.length === 0) return null;
  return [chosen[0]];
}

/**
 * Convenience: OptionBaseProps[] | null -> OptionBaseProps | null
 */
export function toSingle(
  chosen: OptionBaseProps[] | null
): OptionBaseProps | null {
  return chosen?.[0] ?? null;
}

/**
 * Convenience: OptionBaseProps | null -> OptionBaseProps[] | null
 */
export function fromSingle(
  value: OptionBaseProps | null
): OptionBaseProps[] | null {
  return value ? [value] : null;
}