"use client";

import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";

import styles from "./ContributeGoalSheet.module.css";

import { toMinorByCurrency, fromMinorByCurrency } from "@/shared/lib/money/helper";

import type {
  Goal,
  GoalContribution,
  CreateGoalContributionInput,
  UpdateGoalContributionInput,
  SoftDeleteGoalContributionInput,
} from "@/features/goals/model/types";

import { ButtonBase, IconButton } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";
import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldDate } from "@/shared/ui/molecules/FormField/FormFieldDate";
import { Trash2 } from "lucide-react";

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

type FormValues = {
  amount: string;           // major units string
  dateKey: string | null;   // YYYY-MM-DD
  note: string;             // optional
};

export type ContributeGoalSheetProps = {
  open: boolean;
  onClose: () => void;

  goal: Goal;

  /** initial -> edit */
  contribution?: GoalContribution;

  onCreate: (input: CreateGoalContributionInput) => Promise<void> | void;
  onUpdate: (input: UpdateGoalContributionInput) => Promise<void> | void;

  /** optional: show Delete in edit mode */
  onDelete?: (input: SoftDeleteGoalContributionInput) => Promise<void> | void;
};

export function ContributeGoalSheet({
  open,
  onClose,
  goal,
  contribution,
  onCreate,
  onUpdate,
  onDelete,
}: ContributeGoalSheetProps) {
  const isEdit = Boolean(contribution);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      amount: "",
      dateKey: todayKey(),
      note: "",
    },
    mode: "onSubmit",
  });

  // Prefill / reset on open
  React.useEffect(() => {
    if (!open) return;

    setSaving(false);
    setDeleting(false);

    if (!contribution) {
      form.reset({
        amount: "",
        dateKey: todayKey(),
        note: "",
      });
      return;
    }

    form.reset({
      amount: fromMinorByCurrency(contribution.amountMinor, goal.currency),
      dateKey: contribution.dateKey ?? todayKey(),
      note: contribution.note ?? "",
    });
  }, [open, contribution, goal.currency, form]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    form.clearErrors("amount");
    form.clearErrors("dateKey");

    const amountMinor = toMinorByCurrency(values.amount, goal.currency);
    if (amountMinor == null || amountMinor <= 0) {
      form.setError("amount", {
        type: "validate",
        message: "Введите сумму больше нуля",
      });
      return;
    }

    const dateKey = values.dateKey ?? todayKey();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      form.setError("dateKey", { type: "validate", message: "Некорректная дата" });
      return;
    }

    const note = values.note?.trim() ? values.note.trim() : null;

    setSaving(true);
    try {
      if (!isEdit) {
        const input: CreateGoalContributionInput = {
          goalId: goal.id,
          amountMinor,
          currency: goal.currency,
          dateKey,
          note,
          linkedTransactionId: null,
        };

        await onCreate(input);
      } else {
        const input: UpdateGoalContributionInput = {
          id: contribution!.id,
          patch: {
            amountMinor,
            dateKey,
            note,
          },
        };

        await onUpdate(input);
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete({ id: contribution!.id });
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      title={
        <ModalHeader
          title={isEdit ? "Edit contribution" : "Top up goal"}
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
            disabled={saving || deleting}
          >
            {saving ? "Saving…" : "Save"}
          </ButtonBase>
          {isEdit && onDelete && (
            <IconButton
              icon={Trash2}
              variant="default"
              onClick={handleDelete}
              disabled={saving || deleting}
              className={styles.deleteButton}
            />
          )}
        </div>
      }
    >
      <FormProvider {...form}>
        <div className={styles.form}>
          <FormFieldString<FormValues>
            name="amount"
            label="Amount"
            placeholder="0"
            rightSlot={goal.currency}
            rules={{
              required: "Введите сумму",
              validate: (v) => {
                if (!v) return "Введите сумму";
                const minor = toMinorByCurrency(v, goal.currency);
                if (minor == null || minor <= 0) return "Введите сумму больше нуля";
                return true;
              },
            }}
          />

          <FormFieldDate<FormValues>
            name="dateKey"
            label="Date"
            rules={{ required: "Choose a date" }}
          />

          <FormFieldString<FormValues>
            name="note"
            label="Note (optional)"
            placeholder="Add a note"
            multiline
          />
        </div>
      </FormProvider>
    </BottomSheet>
  );
}

ContributeGoalSheet.displayName = "ContributeGoalSheet";
export default ContributeGoalSheet;