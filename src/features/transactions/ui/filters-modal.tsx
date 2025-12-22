"use client";

import { Modal } from "@/shared/ui/modal";
import type { Category } from "@/features/categories/model/types";

export type TxFilters = {
    type: "all" | "expense" | "income";
    categoryId: string; // "" = all
    query: string;
};

export type SortKey = "none" | "amount" | "type" | "category";
export type SortDir = "desc" | "asc";
export type SortState = { key: "none" } | { key: Exclude<SortKey, "none">; dir: SortDir };


function hasActiveExtraFilters(filters: TxFilters) {
    return filters.type !== "all" || !!filters.categoryId;
}

export function TransactionsFiltersModal({
    open,
    onClose,
    categories,
    filters,
    onChange,
    sort,
    onToggleSort,
    onResetSort,
    onReset,
}: {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    filters: TxFilters;
    onChange: (patch: Partial<TxFilters>) => void;
    sort: SortState;
    onToggleSort: (key: Exclude<SortKey, "none">) => void;
    onResetSort: () => void;
    onReset: () => void;
}) {
    const active = hasActiveExtraFilters(filters);

    return (
        <Modal open={open} title="Фильтры" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <div className="text-sm opacity-70">Тип</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            className={`rounded-xl border py-2 ${filters.type === "all" ? "font-semibold" : "opacity-70"}`}
                            onClick={() => onChange({ type: "all" })}
                        >
                            Все
                        </button>
                        <button
                            type="button"
                            className={`rounded-xl border py-2 ${filters.type === "expense" ? "font-semibold" : "opacity-70"}`}
                            onClick={() => onChange({ type: "expense" })}
                        >
                            Расход
                        </button>
                        <button
                            type="button"
                            className={`rounded-xl border py-2 ${filters.type === "income" ? "font-semibold" : "opacity-70"}`}
                            onClick={() => onChange({ type: "income" })}
                        >
                            Доход
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm opacity-70">Категория</label>
                    <select
                        className="mt-1 w-full rounded-xl border px-3 py-3"
                        value={filters.categoryId}
                        onChange={(e) => onChange({ categoryId: e.target.value })}
                    >
                        <option value="">Все категории</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort section */}
                <div>
                    <div className="text-sm opacity-70">Сортировка</div>

                    <div className="mt-2 space-y-2">
                        <button
                            type="button"
                            className="w-full rounded-xl border px-3 py-3 text-left"
                            onClick={() => onToggleSort("amount")}
                        >
                            <div className="flex items-center justify-between">
                                <span>Сумма</span>
                                <span className="opacity-70">
                                    {sort.key === "amount" ? (sort.dir === "desc" ? "↓" : "↑") : ""}
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="w-full rounded-xl border px-3 py-3 text-left"
                            onClick={() => onToggleSort("type")}
                        >
                            <div className="flex items-center justify-between">
                                <span>Тип транзакции</span>
                                <span className="opacity-70">
                                    {sort.key === "type" ? (sort.dir === "desc" ? "↓" : "↑") : ""}
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="w-full rounded-xl border px-3 py-3 text-left"
                            onClick={() => onToggleSort("category")}
                        >
                            <div className="flex items-center justify-between">
                                <span>Категория</span>
                                <span className="opacity-70">
                                    {sort.key === "category" ? (sort.dir === "desc" ? "↓" : "↑") : ""}
                                </span>
                            </div>
                        </button>

                        {sort.key !== "none" ? (
                            <button
                                type="button"
                                className="w-full rounded-xl border px-3 py-2 text-sm opacity-80"
                                onClick={onResetSort}
                            >
                                Сбросить сортировку
                            </button>
                        ) : null}
                    </div>
                </div>



                {/* Reset & Confirm buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className="rounded-2xl border py-3 font-semibold"
                        onClick={() => {
                            onReset();
                            onClose();
                        }}
                    >
                        Сбросить
                    </button>

                    <button
                        type="button"
                        className="rounded-2xl bg-black text-white py-3 font-semibold"
                        onClick={onClose}
                    >
                        {active ? "Применить" : "Закрыть"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function FiltersIconButton({
    active,
    onClick,
}: {
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-label="Фильтры"
            title="Фильтры"
            onClick={onClick}
            className="relative rounded-xl border px-3 py-2"
        >
            {/* простая иконка-фильтр (воронка) без зависимостей */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="block">
                <path
                    d="M3 5h18l-7 8v5l-4 2v-7L3 5z"
                    fill="currentColor"
                />
            </svg>

            {/* badge если активны фильтры */}
            {active ? (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-black" />
            ) : null}
        </button>
    );
}
