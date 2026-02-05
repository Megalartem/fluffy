"use client";

import * as React from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import {
  FiltersSheet,
  SearchBar,
  ModalActions,
  FormFieldSegment,
  FormFieldToggle,
} from "@/shared/ui/molecules";

import type {
  CategoriesFilterValues,
  CategoriesFilterType,
} from "@/features/categories/model/filter-types";

type SegmentOption<T extends string> = { value: T; label: string };

const TYPE_OPTIONS: Array<SegmentOption<CategoriesFilterType>> = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
];

type FormValues = {
  type: CategoriesFilterType;
  showArchived: boolean;
};

export interface CategoriesFilterProps {
  value: CategoriesFilterValues;
  onChange: (newFilters: CategoriesFilterValues) => void;
  className?: string;
}

export const CategoriesFilter = React.memo(function CategoriesFilter({
  value,
  onChange,
  className,
}: CategoriesFilterProps) {
  const [openFilters, setOpenFilters] = React.useState(false);

  // RHF draft state for the filters sheet
  const form = useForm<FormValues>({
    defaultValues: {
      type: value.type,
      showArchived: value.showArchived,
    },
    mode: "onSubmit",
  });

  // Keep form in sync when sheet opens (so draft starts from committed value)
  React.useEffect(() => {
    if (!openFilters) return;
    form.reset({
      type: value.type,
      showArchived: value.showArchived,
    });
  }, [openFilters, value.type, value.showArchived, form]);

  // Helper to update only some committed fields
  const setPartial = React.useCallback(
    (patch: Partial<CategoriesFilterValues>) => {
      onChange({ ...value, ...patch });
    },
    [value, onChange]
  );

  const resetAll = React.useCallback(() => {
    const next: CategoriesFilterValues = {
      query: "",
      type: "all",
      showArchived: false,
    };
    onChange(next);
    // if sheet is open, reset draft too
    form.reset({
      type: next.type,
      showArchived: next.showArchived,
    });
  }, [onChange, form]);

  const filtersActive = Boolean(
    value.query.trim() ||
    value.type !== "all" ||
    value.showArchived
  );

  const onApply: SubmitHandler<FormValues> = React.useCallback(
    (draft) => {
      onChange({
        ...value,
        type: draft.type,
        showArchived: draft.showArchived,
      });
      setOpenFilters(false);
    },
    [value, onChange]
  );

  return (
    <div className={className}>
      <SearchBar
        value={value.query}
        onChange={(next) => setPartial({ query: next })}
        placeholder="Search categories..."
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
              onClick: resetAll,
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
          <FormFieldSegment<FormValues, CategoriesFilterType>
            name="type"
            label="Category type"
            options={TYPE_OPTIONS}
            size="m"
          />

          <FormFieldToggle
            name="showArchived"
            label="Show archived"
            helperText="Include archived categories in the list"
          />
        </FormProvider>
      </FiltersSheet>
    </div>
  );
});
