"use client";

import React from "react";
import clsx from "clsx";
import styles from "./TransactionsFilter.module.css";

import { OptionBaseProps, Text } from "@/shared/ui/atoms";
import { CategoryField } from "../CategoryField/CategoryField";
import type { TransactionsSortOption, TransactionsSortValue } from "./sheets/SortOptionsSheet";
import { CategoriesSheet } from "../CategoryField/CategoriesSheet";


import { FiltersSheet, SearchBar, ModalActions, SortControl } from "@/shared/ui/molecules";
import { TransactionsTypes, TransactionTypeField } from "../../molecules/TransactionTypeField/TransactionTypeField";


export type TransactionsFiltersValue = {
  query: string;
  type: TransactionsTypes;
  categories: OptionBaseProps[];
  sort: TransactionsSortValue;
};


export function TransactionsFilter({
  value,
  onChange,
  categoryOptions,
  sortOptions,
  className,
}: {
  value: TransactionsFiltersValue;
  onChange: (next: TransactionsFiltersValue) => void;
  categoryOptions: OptionBaseProps[];
  sortOptions: TransactionsSortOption[];
  className?: string;
}) {
  const [openFilters, setOpenFilters] = React.useState(false);
  const [openCategories, setOpenCategories] = React.useState(false);

  // draft state for OptionControl (so it doesn't instantly commit until Apply)
  const [draftCategories, setDraftCategories] = React.useState<OptionBaseProps[] | null>(null);

  React.useEffect(() => {
    if (openCategories) {
      setDraftCategories(value.categories);
    }
  }, [openCategories, value.categories]);

  function setPartial(patch: Partial<TransactionsFiltersValue>) {
    onChange({ ...value, ...patch });
  }

  function resetAll() {
    onChange({
      query: "",
      type: "all",
      categories: [],
      sort: { key: null, direction: null },
    });
  }

  const filtersActive = Boolean(
    value.query.trim() ||
      value.type !== "all" ||
      value.categories.length > 0 ||
      value.sort.key ||
      value.sort.direction
  );

  return (
    <div className={clsx(styles.root, className)}>
      <SearchBar
        value={value.query}
        onChange={(next) => setPartial({ query: next })}
        placeholder="Search"
        onOpenFilters={() => setOpenFilters(true)}
        filtersActive={filtersActive}
      />

      <FiltersSheet
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        title="Filters"
        footer={
          <ModalActions
            secondary={{ label: "Reset All", onClick: () => { resetAll(); }, disabled: !filtersActive }}
            primary={{ label: "Apply", onClick: () => setOpenFilters(false) }}
            layout="row"
          />
        }
      >
        <TransactionTypeField
          value={value.type}
          onChange={(next) => setPartial({ type: next })}
        />

        <CategoryField
          values={value.categories}
          isOpen={openCategories}
          onOpen={() => setOpenCategories(true)}
          onRemove={(removed) =>
            setPartial({
              categories: value.categories.filter((c) => c.value !== removed.value),
            })
          }
        />
        <div className={styles.section}>
          <Text variant="label">Sorting</Text>
          <SortControl
            options={sortOptions}
            value={value.sort}
            onChange={(next) => setPartial({ sort: next })}
          />
        </div>
      </FiltersSheet>

      <CategoriesSheet
        open={openCategories}
        title="Categories"
        onClose={() => setOpenCategories(false)}
        options={categoryOptions}
        chosenOptions={draftCategories}
        onChange={setDraftCategories}
        onApply={(chosen) => {
          setPartial({ categories: chosen || [] });
          setOpenCategories(false);
        }}
      />
    </div>
  );
}