"use client";

import * as React from "react";
import {
  FormProvider,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

import styles from "./TransactionUpsertSheet.module.css";
import type { Category } from "@/features/categories/model/types";
import type {
  Transaction,
  TransactionType,
  CurrencyCode,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/features/transactions/model/types";

import type { IOptionBase } from "@/shared/ui/atoms";
import { ButtonBase } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";

import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldSelect } from "@/shared/ui/molecules/FormField/FormFieldSelect";
import { FormFieldSegment } from "@/shared/ui/molecules/FormField/FormFieldSegment";
import { FormFieldDate } from "@/shared/ui/molecules/FormField/FormFieldDate";

import { CategoriesSheet } from "../CategoryField/CategoriesSheet";

import {
  buildCategoryOptions,
  findCategoryOption,
} from "@/features/transactions/lib/categoryOptions";
import { renderCategoryIcon } from "@/shared/lib/renderCategoryIcon";

import { toMinorByCurrency, fromMinorByCurrency } from "@/shared/lib/money/helper";
import { AppError } from "@/shared/errors/app-error";

interface defaultCategoryState {
  id: string;
  type: TransactionType;
}

interface ITransactionUpsertSheet {
  open: boolean;
  onClose: () => void;

  workspaceId: string;
  /**
   * Initial transaction type context.
   * For MVP we still allow switching between expense/income inside the form
   * (unless `type === "transfer"`, then type is fixed).
   */
  type: TransactionType;
  currency: CurrencyCode;

  categories: Category[];
  defaultCategoryState?: defaultCategoryState;

  /**
   * Если передали initial — считаем, что это edit.
   * (Можно заменить на mode, но так проще в интеграции: initial? значит edit)
   */
  initial?: Transaction;

  /** Можно оставить note на потом: в MVP держим null/как есть */
  onCreate: (input: CreateTransactionInput) => Promise<void> | void;
  onUpdate: (input: UpdateTransactionInput) => Promise<void> | void;
};

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const TYPE_OPTIONS: Array<{ value: TransactionType; label: string }> = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

type FormValues = {
  type: TransactionType;
  amount: string;
  categoryId: string | null;
  dateKey: string | null; // YYYY-MM-DD
};

export function TransactionUpsertSheet({
  open,
  onClose,
  workspaceId,
  type,
  currency,
  categories,
  defaultCategoryState,
  initial,
  onCreate,
  onUpdate,
}: ITransactionUpsertSheet) {
  const isEdit = Boolean(initial);

  const form = useForm<FormValues>({
    defaultValues: {
      type: type === "transfer" ? "transfer" : TYPE_OPTIONS[0].value,
      amount: "",
      categoryId: null,
      dateKey: todayKey(),
    },
    mode: "onSubmit",
  });

  const [catOpen, setCatOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Watch type to adjust category options if needed.
  const watchedType = useWatch({ control: form.control, name: "type" });
  const txTypeForOptions = type === "transfer" ? "transfer" : watchedType;

  // Options for CategoriesSheet and for FormSelectField (display)
  const categoryOptions = React.useMemo<IOptionBase[]>(
    () =>
      buildCategoryOptions({
        categories,
        txType: txTypeForOptions,
        renderIcon: renderCategoryIcon,
      }),
    [categories, txTypeForOptions]
  );

  const categoryOptionsByValue = React.useMemo<Record<string, IOptionBase>>(
    () =>
      categoryOptions.reduce<Record<string, IOptionBase>>((acc, opt) => {
        acc[String(opt.value)] = opt;
        return acc;
      }, {}),
    [categoryOptions]
  );

  // Prefill / reset on open
  React.useEffect(() => {
    if (!open) return;

    setSaving(false);
    setCatOpen(false);

    if (!initial) {
      // create
      const initialType: TransactionType =
        type === "transfer"
          ? "transfer"
          : (defaultCategoryState?.type ?? TYPE_OPTIONS[0].value);
      const defaultId =
        initialType === "transfer" ? null : (defaultCategoryState?.id ?? null);

      const isDefaultIdValid =
        Boolean(defaultId) && categories.some((c) => c.id === defaultId);

      form.reset({
        type: initialType,
        amount: "",
        categoryId: isDefaultIdValid ? defaultId : null,
        dateKey: todayKey(),
      });
      return;
    }

    // edit
    form.reset({
      type: initial.type,
      amount: fromMinorByCurrency(initial.amountMinor, currency),
      categoryId: initial.categoryId ?? null,
      dateKey: initial.dateKey,
    });
  }, [open, initial, currency, form, type, defaultCategoryState, categories]);

  // transfer: category always null and picker must be closed
  React.useEffect(() => {
    if (type !== "transfer") return;
    setCatOpen(false);
    form.setValue("categoryId", null, { shouldValidate: true });
    form.setValue("type", "transfer", { shouldValidate: true });
  }, [type, form]);

  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const chosenCategory = React.useMemo<IOptionBase[] | null>(() => {
    if (!categoryId) return null;
    const opt = findCategoryOption(categoryOptions, categoryId);
    return opt ? [opt] : null;
  }, [categoryId, categoryOptions]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {

    form.clearErrors("amount");

    const amountMinor = toMinorByCurrency(values.amount, currency);
    if (amountMinor == null || amountMinor <= 0) {
      form.setError("amount", {
        type: "validate",
        message: "Введите сумму больше нуля",
      });
      setSaving(false);
      return;
    }

    const dateKey = values.dateKey ?? todayKey();

    const categoryIdValue =
      values.type === "transfer" ? null : (values.categoryId ?? null);

    setSaving(true);
    try {
      if (!isEdit) {
        const input: CreateTransactionInput = {
          workspaceId,
          type: values.type,
          amountMinor,
          currency,
          categoryId: categoryIdValue,
          note: null,
          dateKey,
        };

        await onCreate(input);
      } else {
        const patch = {
          type: values.type,
          amountMinor,
          dateKey,
          categoryId: categoryIdValue,
          // currency/note — не трогаем, так как в форме их нет
        };

        const input: UpdateTransactionInput = {
          id: initial!.id,
          patch,
        };

        await onUpdate(input);
      }

      onClose();
    } catch (e) {
      if (
        e instanceof AppError &&
        e.code === "VALIDATION_ERROR" &&
        e.meta?.field === "amount"
      ) {
        form.setError("amount", { type: "server", message: e.message });
        setSaving(false);
        return;
      }
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BottomSheet
        open={open}
        title={
          <ModalHeader
            title={isEdit ? "Edit transaction" : "New transaction"}
            onClose={onClose}
          />
        }
        height="half"
        onClose={onClose}
        footer={
          <ButtonBase
            fullWidth
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </ButtonBase>
        }
      >
        <FormProvider {...form}>
          <div className={styles.form}>
            {/* Type (MVP): allow switching expense/income unless transfer */}
            {type !== "transfer" && (
              <FormFieldSegment<FormValues, TransactionType>
                name="type"
                label="Transaction type"
                options={TYPE_OPTIONS}
                size="m"
              />
            )}

            {/* Amount */}
            <FormFieldString<FormValues>
              name="amount"
              label="Amount"
              placeholder="0"
              rightSlot={currency}
              rules={{
                required: "Введите сумму",
                validate: (v) => {
                  if (!v) return "Введите сумму";
                  const minor = toMinorByCurrency(v, currency);
                  if (minor == null || minor <= 0) {
                    return "Введите сумму больше нуля";
                  }
                  return true;
                },
              }}
            />

            {/* Category */}
            <FormFieldSelect<FormValues>
              name="categoryId"
              label="Category"
              mode="single"
              placeholder="Choose category"
              onOpen={() => setCatOpen(true)}
              optionsByValue={categoryOptionsByValue}
              rules={{
                validate: (v) => {
                  const currentType = form.getValues("type");
                  if (currentType === "transfer") return true;
                  return v ? true : "Choose category";
                },
              }}
              showChevron
              isOpen={catOpen}
            />

            {/* Date */}
            <FormFieldDate<FormValues>
              name="dateKey"
              label="Date"
              rules={{ required: "Choose a date" }}
            />
          </div>
        </FormProvider>
      </BottomSheet>

      {type !== "transfer" && (
        <CategoriesSheet
          open={catOpen}
          mode="single"
          title="Category"
          onClose={() => setCatOpen(false)}
          options={categoryOptions}
          chosenOptions={chosenCategory}
          onChange={(val) => {
            // live preview: update field value while browsing
            const next = Array.isArray(val) && val[0] ? String(val[0].value) : null;
            form.setValue("categoryId", next, { shouldValidate: true });
          }}
          onApply={(chosen) => {
            const next = Array.isArray(chosen) && chosen[0] ? String(chosen[0].value) : null;
            form.setValue("categoryId", next, { shouldValidate: true });
            setCatOpen(false);
          }}
        />
      )}
    </>
  );
}

export default TransactionUpsertSheet;