 import type { IOptionBase } from "@/shared/ui/atoms";

/**
 * Гарантирует single-семантику для chosenOptions (массив/nullable контракт).
 * - null/[] -> null
 * - [a, b, ...] -> [a]
 */
export function normalizeSingleChosen(
  chosen: IOptionBase[] | null
): IOptionBase[] | null {
  if (!chosen || chosen.length === 0) return null;
  return [chosen[0]];
}

/**
 * Convenience: IOptionBase[] | null -> IOptionBase | null
 */
export function toSingle(
  chosen: IOptionBase[] | null
): IOptionBase | null {
  return chosen?.[0] ?? null;
}

/**
 * Convenience: IOptionBase | null -> IOptionBase[] | null
 */
export function fromSingle(
  value: IOptionBase | null
): IOptionBase[] | null {
  return value ? [value] : null;
}