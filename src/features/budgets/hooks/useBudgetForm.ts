"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { CreateBudgetInput, Budget } from "../model/types";
import type { CurrencyCode } from "@/shared/di/types";

export type BudgetFormValues = {
  categoryId: string;
  limitMinor: number; // Amount in minor units (cents)
  currency: CurrencyCode;
  period: "monthly";
};

export type UseBudgetFormOptions = {
  budget?: Budget;
  defaultCurrency: CurrencyCode;
  onSubmit: (input: CreateBudgetInput | { id: string; patch: { limitMinor: number } }) => Promise<void>;
};

/**
 * Hook for budget form state management with React Hook Form
 */
export function useBudgetForm(options: UseBudgetFormOptions) {
  const { budget, defaultCurrency, onSubmit } = options;

  const isEdit = Boolean(budget?.id);

  const form = useForm<BudgetFormValues>({
    defaultValues: {
      categoryId: "",
      limitMinor: 0,
      currency: defaultCurrency,
      period: "monthly",
    },
    mode: "onSubmit",
  });

  // Reset form when budget changes or sheet opens
  React.useEffect(() => {
    if (!budget?.id) {
      form.reset({
        categoryId: "",
        limitMinor: 0,
        currency: defaultCurrency,
        period: "monthly",
      });
      return;
    }

    // Edit mode - prefill with existing budget
    form.reset({
      categoryId: budget.categoryId,
      limitMinor: budget.limitMinor,
      currency: budget.currency,
      period: budget.period,
    });
  }, [budget, defaultCurrency, form]);

  const handleSubmit = React.useCallback(
    async (values: BudgetFormValues) => {
      // Clear previous errors
      form.clearErrors();

      // Validate categoryId
      if (!values.categoryId.trim()) {
        form.setError("categoryId", {
          type: "required",
          message: "Please select a category",
        });
        return;
      }

      // Validate limitMinor
      if (!values.limitMinor || values.limitMinor <= 0) {
        form.setError("limitMinor", {
          type: "min",
          message: "Limit must be greater than 0",
        });
        return;
      }

      // Submit
      if (!isEdit) {
        const input: CreateBudgetInput = {
          categoryId: values.categoryId,
          limitMinor: values.limitMinor,
          currency: values.currency,
          period: values.period,
        };
        await onSubmit(input);
      } else {
        // Update mode - only limitMinor can be changed
        await onSubmit({
          id: budget!.id,
          patch: { limitMinor: values.limitMinor },
        });
      }
    },
    [form, isEdit, budget, onSubmit]
  );

  return {
    form,
    isEdit,
    handleSubmit,
  } as const;
}
