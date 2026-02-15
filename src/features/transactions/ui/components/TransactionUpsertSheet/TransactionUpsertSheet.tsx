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
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/features/transactions/model/types";
import { useGoal } from "@/features/goals/hooks";


import type { IOptionBase } from "@/shared/ui/atoms";
import { ButtonBase, IconButton, CategoryIcon } from "@/shared/ui/atoms";
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
import { Trash2, Target } from "lucide-react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { goalContributionsService } from "@/features/goals/model/contributions.service";

interface defaultCategoryState {
  id: string;
  type: TransactionType;
}

interface ITransactionUpsertSheet {
  open: boolean;
  categories: Category[];
  defaultCategoryState?: defaultCategoryState;
  transaction?: Transaction;

  onClose: () => void;
  onCreate: (input: CreateTransactionInput) => Promise<void> | void;
  onUpdate: (input: UpdateTransactionInput) => Promise<void> | void;
  onDelete?: (input: Transaction) => void;
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
  note?: string;
};

export function TransactionUpsertSheet({
  open,
  onClose,
  categories,
  defaultCategoryState,
  transaction,
  onCreate,
  onUpdate,
  onDelete,
}: ITransactionUpsertSheet) {
  const isEdit = Boolean(transaction?.id);
  const { workspaceId, currency } = useWorkspace();

  // Load goal if transaction is linked to one
  const { item: linkedGoal } = useGoal(transaction?.linkedGoalId ?? null);
  const isGoalTransaction = Boolean(transaction?.linkedGoalId);

  const form = useForm<FormValues>({
    defaultValues: {
      type: defaultCategoryState?.type ?? TYPE_OPTIONS[0].value,
      amount: "",
      categoryId: null,
      dateKey: todayKey(),
      note: "",
    },
    mode: "onSubmit",
  });

  const [catOpen, setCatOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const watchedType = useWatch({ control: form.control, name: "type" });

  const categoryOptions = React.useMemo(() => {
    const effectiveType = watchedType ?? (defaultCategoryState?.type ?? TYPE_OPTIONS[0].value);

    const opts = buildCategoryOptions({
      categories,
      txType: effectiveType,
      includeArchived: false,
      renderIcon: renderCategoryIcon,
    });

    return opts;
  }, [categories, watchedType, defaultCategoryState]);

  // Special option for goal-linked transactions
  const goalCategoryOption = React.useMemo<IOptionBase | null>(() => {
    if (!isGoalTransaction || !linkedGoal) return null;
    return {
      value: `goal:${linkedGoal.id}`,
      label: linkedGoal.name,
      icon: (
        <CategoryIcon
          icon={Target}
          size="s"
          color="green"
          importance="secondary"
        />
      ),
    };
  }, [isGoalTransaction, linkedGoal]);

  const categoryOptionsByValue = React.useMemo<Record<string, IOptionBase>>(
    () => {
      const base = categoryOptions.reduce<Record<string, IOptionBase>>((acc, opt) => {
        acc[String(opt.value)] = opt;
        return acc;
      }, {});

      // Add goal option if transaction is linked to a goal
      if (goalCategoryOption) {
        base[String(goalCategoryOption.value)] = goalCategoryOption;
      }

      return base;
    },
    [categoryOptions, goalCategoryOption]
  );

  // Prefill / reset on open
  React.useEffect(() => {
    if (!open) return;

    setSaving(false);
    setCatOpen(false);

    if (!isEdit) {
      // create
      const initialType: TransactionType = defaultCategoryState?.type ?? TYPE_OPTIONS[0].value;
      const defaultId = defaultCategoryState?.id ?? null;

      const isDefaultIdValid =
        Boolean(defaultId) && categories.some((c) => c.id === defaultId);

      form.reset({
        type: initialType,
        amount: "",
        categoryId: isDefaultIdValid ? defaultId : null,
        dateKey: todayKey(),
        note: "",
      });
      return;
    }

    // edit
    form.reset({
      type: transaction?.type ?? TYPE_OPTIONS[0].value,
      amount: transaction ? fromMinorByCurrency(transaction?.amountMinor, transaction?.currency) : "",
      categoryId: transaction?.categoryId ?? null,
      dateKey: transaction?.dateKey ?? todayKey(),
      note: transaction?.note ?? "",
    });
  }, [open, isEdit, transaction, form, defaultCategoryState, categories]);

  // Set special category value for goal transactions
  React.useEffect(() => {
    if (!isGoalTransaction || !linkedGoal || !open) return;
    form.setValue("categoryId", `goal:${linkedGoal.id}`);
  }, [isGoalTransaction, linkedGoal, form, open]);

  // transfer: category always null and picker must be closed
  React.useEffect(() => {
    if (transaction?.type !== "transfer") return;
    setCatOpen(false);
    form.setValue("categoryId", null, { shouldValidate: true });
    form.setValue("type", "transfer", { shouldValidate: true });
  }, [transaction, form]);

  // Goal transactions: block category editing
  React.useEffect(() => {
    if (!isGoalTransaction) return;
    setCatOpen(false);
  }, [isGoalTransaction]);

  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const chosenCategory = React.useMemo<IOptionBase[] | null>(() => {
    if (!categoryId) return null;
    const opt = findCategoryOption(categoryOptions, categoryId);
    return opt ? [opt] : null;
  }, [categoryId, categoryOptions]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    form.clearErrors("amount");
    form.clearErrors("dateKey");

    const amountMinor = toMinorByCurrency(values.amount, transaction?.currency ?? currency);
    if (amountMinor == null || amountMinor <= 0) {
      form.setError("amount", {
        type: "validate",
        message: "Введите сумму больше нуля",
      });
      setSaving(false);
      return;
    }

    const dateKey = values.dateKey ?? todayKey();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      form.setError("dateKey", { type: "validate", message: "Некорректная дата" });
      return;
    }

    const categoryIdValue =
      values.type === "transfer" ? null : (values.categoryId ?? null);

    setSaving(true);
    try {
      if (!isEdit) {
        const input: CreateTransactionInput = {
          workspaceId,
          type: values.type,
          amountMinor,
          currency: transaction?.currency ?? currency,
          categoryId: categoryIdValue,
          note: values.note ?? null,
          dateKey,
        };

        await onCreate(input);
      } else {
        const patch = {
          type: values.type,
          amountMinor,
          dateKey,
          categoryId: categoryIdValue,
          note: values.note ?? null,
        };

        const input: UpdateTransactionInput = {
          id: transaction!.id,
          patch,
        };

        await onUpdate(input);

        // Sync changes to linked goal contribution if this is a goal transaction
        if (transaction && isGoalTransaction && transaction.linkedGoalId) {
          try {
            const contribution = await goalContributionsService.findByLinkedTransactionId(
              workspaceId,
              transaction.id
            );

            if (contribution) {
              await goalContributionsService.update(workspaceId, contribution.id, {
                amountMinor: patch.amountMinor,
                dateKey: patch.dateKey,
                note: patch.note ?? null,
              });
            }
          } catch (e) {
            console.warn("Failed to sync goal contribution:", e);
            // Don't fail the transaction update if contribution sync fails
          }
        }
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


  const handleDelete = () => {
    if (!isEdit || !onDelete || !transaction) return;
    onDelete(transaction);
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
          <div className={styles.footer}>
            <ButtonBase
              fullWidth
              onClick={form.handleSubmit(onSubmit)}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </ButtonBase>
            {isEdit && onDelete && (
              <IconButton
                icon={Trash2}
                variant="default"
                onClick={handleDelete}
                disabled={saving}
                className={styles.deleteButton}
              />
            )}
          </div>
        }
      >
        <FormProvider {...form}>
          <div className={styles.form}>
            {transaction?.type !== "transfer" && (
              <FormFieldSegment<FormValues, TransactionType>
                name="type"
                label="Transaction type"
                options={TYPE_OPTIONS}
                size="m"
                disabled={isGoalTransaction}
              />
            )}

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
              onOpen={() => !isGoalTransaction && setCatOpen(true)}
              optionsByValue={categoryOptionsByValue}
              showChevron
              removable
              isOpen={catOpen}
              disabled={isGoalTransaction}
            />

            {/* Date */}
            <FormFieldDate<FormValues>
              name="dateKey"
              label="Date"
              rules={{ required: "Choose a date" }}
            />

            {/* Note */}
            <FormFieldString<FormValues>
              name="note"
              label="Note (optional)"
              placeholder="Add a note"
              multiline={true}
            />
          </div>
        </FormProvider>
      </BottomSheet>

      {transaction?.type !== "transfer" && (
        <CategoriesSheet
          open={catOpen}
          mode="single"
          title="Category"
          onClose={() => setCatOpen(false)}
          options={categoryOptions}
          chosenOptions={chosenCategory}
          onChange={(val) => {
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