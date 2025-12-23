/**
 * CategorySelector - Category dropdown with "No category" option
 */

import type { Category } from "@/features/categories/model/types";

interface CategorySelectorProps {
  categories: Category[];
  value: string; // "" = none
  onChange: (categoryId: string) => void;
  disabled?: boolean;
}

export function CategorySelector({
  categories,
  value,
  onChange,
  disabled = false,
}: CategorySelectorProps) {
  return (
    <div>
      <label className="text-sm opacity-70">Категория</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border px-3 py-3"
      >
        <option value="">Без категории</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
