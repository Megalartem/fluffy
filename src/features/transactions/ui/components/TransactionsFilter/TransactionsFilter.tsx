"use client";

import React from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

import { IOptionBase, Text } from "@/shared/ui/atoms";
import {
  FiltersSheet,
  SearchBar,
  ModalActions,
  SortControl,
} from "@/shared/ui/molecules";

import { CategoriesSheet } from "../CategoryField/CategoriesSheet";
import { FormFieldSelect } from "@/shared/ui/molecules/FormField/FormFieldSelect";
import { FormFieldSegment } from "@/shared/ui/molecules/FormField/FormFieldSegment";
import type { TransactionsSortOption } from "./sheets/SortOptionsSheet";
import type {
  TransactionsFilterValues,
  TransactionsSortValue,
} from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";
import { buildCategoryOptions } from "@/features/transactions/lib/categoryOptions";
import { renderCategoryIcon } from "@/shared/lib/renderCategoryIcon";

export type TransactionsTypes = "all" | "expense" | "income" | "transfer";

type SegmentOption<T extends string> = { value: T; label: string };

const TYPE_OPTIONS: Array<SegmentOption<TransactionsTypes>> = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  // { value: "transfer", label: "Transfer" },
];

export type TransactionsFiltersValue = {
  query: string;
  type: TransactionsTypes;
  /** Store only ids for filtering */
  categoryIds: string[];
  sort: TransactionsSortValue;
};

type FormValues = {
  type: TransactionsTypes;
  categoryIds: string[];
  sort: TransactionsSortValue;
};

export function TransactionsFilter({
  value,
  onChange,
  categories,
  sortOptions,
  className,
}: {
  value: TransactionsFilterValues;
  onChange: (newFilters: TransactionsFilterValues) => void;
  categories: Category[];
  sortOptions: TransactionsSortOption[];
  className?: string;
}) {
  const [openFilters, setOpenFilters] = React.useState(false);
  const [openCategories, setOpenCategories] = React.useState(false);

  // Build category options based on current filter type
  const categoryOptions = React.useMemo(() => {
    const txType = value.type === "all" ? "expense" : value.type;
    return buildCategoryOptions({
      categories,
      txType,
      includeArchived: false,
      renderIcon: renderCategoryIcon,
    });
  }, [categories, value.type]);

  // RHF draft state for the filters sheet
  const form = useForm<FormValues>({
    defaultValues: {
      type: value.type,
      categoryIds: value.categoryIds,
      sort: value.sort,
    },
    mode: "onSubmit",
  });

  // Map options by id for FormFieldSelect (label/icon rendering)
  const optionsByValue = React.useMemo<Record<string, IOptionBase>>(
    () =>
      categoryOptions.reduce<Record<string, IOptionBase>>((acc, opt) => {
        acc[String(opt.value)] = opt;
        return acc;
      }, {}),
    [categoryOptions]
  );

  // Keep form in sync when sheet opens (so draft starts from committed value)
  React.useEffect(() => {
    if (!openFilters) return;
    form.reset({
      type: value.type,
      categoryIds: value.categoryIds,
      sort: value.sort,
    });
  }, [openFilters, value.type, value.categoryIds, value.sort, form]);

  // Helper to update only some committed fields
  function setPartial(patch: Partial<TransactionsFiltersValue>) {
    onChange({ ...value, ...patch });
  }

  function resetAll() {
    const next: TransactionsFiltersValue = {
      query: "",
      type: "all",
      categoryIds: [],
      sort: { key: null, direction: null },
    };
    onChange(next);
    // if sheet is open, reset draft too
    form.reset({
      type: next.type,
      categoryIds: next.categoryIds,
      sort: next.sort,
    });
  }

  const filtersActive = Boolean(
    value.query.trim() ||
      value.type !== "all" ||
      value.categoryIds.length > 0 ||
      value.sort.key ||
      value.sort.direction
  );

  // --- Categories sheet draft (OptionBaseProps[]) ---
  const watchedCategoryIds = useWatch({ control: form.control, name: "categoryIds" });
  const [draftCategories, setDraftCategories] = React.useState<IOptionBase[] | null>(null);

  React.useEffect(() => {
    if (!openCategories) return;
    const ids = watchedCategoryIds ?? [];
    const chosen = ids
      .map((id) => optionsByValue[String(id)])
      .filter(Boolean) as IOptionBase[];
    setDraftCategories(chosen);
  }, [openCategories, watchedCategoryIds, optionsByValue]);

  const onApply: SubmitHandler<FormValues> = (draft) => {
    onChange({
      ...value,
      type: draft.type,
      categoryIds: draft.categoryIds,
      sort: draft.sort,
    });
    setOpenFilters(false);
  };

  return (
    <div className={className}>
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
            secondary={{
              label: "Reset All",
              onClick: () => {
                resetAll();
              },
              disabled: !filtersActive,
            }}
            primary={{
              label: "Apply",
              onClick: form.handleSubmit(onApply),
            }}
            layout="row"
          />
        }
      >
        <FormProvider {...form}>
          <FormFieldSegment<FormValues, TransactionsTypes>
            name="type"
            label="Transaction type"
            options={TYPE_OPTIONS}
            size="m"
          />

          <FormFieldSelect<FormValues>
            name="categoryIds"
            label="Categories"
            mode="multi"
            isOpen={openCategories}
            placeholder="All categories"
            onOpen={() => setOpenCategories(true)}
            optionsByValue={optionsByValue}
            removable
          />

          <div>
            <Text variant="label">Sorting</Text>
            <Controller
              control={form.control}
              name="sort"
              render={({ field }) => (
                <SortControl
                  options={sortOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </FormProvider>
      </FiltersSheet>

      <CategoriesSheet
        open={openCategories}
        title="Categories"
        onClose={() => setOpenCategories(false)}
        options={categoryOptions}
        chosenOptions={draftCategories}
        onChange={setDraftCategories}
        onApply={(chosen) => {
          const ids = (chosen ?? []).map((c) => String(c.value));
          form.setValue("categoryIds", ids, { shouldDirty: true });
          setOpenCategories(false);
        }}
      />
    </div>
  );
}