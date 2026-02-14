"use client";

import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";

import styles from "./GoalUpsertSheet.module.css";

import { toMinorByCurrency, fromMinorByCurrency } from "@/shared/lib/money/helper";

import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/features/goals/model/types";

import { ButtonBase } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";
import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldDate } from "@/shared/ui/molecules/FormField/FormFieldDate";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";

type FormValues = {
  name: string;
  targetAmount: string;      // major units string
  deadline: string | null;   // YYYY-MM-DD
  note: string;
};

export type GoalUpsertSheetProps = {
  open: boolean;
  onClose: () => void;

  /** initial -> edit */
  goal?: Goal;

  onCreate: (input: CreateGoalInput) => Promise<void> | void;
  onUpdate: (input: UpdateGoalInput) => Promise<void> | void;
};

export function GoalUpsertSheet({
  open,
  onClose,
  goal,
  onCreate,
  onUpdate,
}: GoalUpsertSheetProps) {
  // TODO: move currency to form context or pass as prop, so that form can do validation and conversion without needing to know about workspace
  const { currency } = useWorkspace();
  const isEdit = Boolean(goal);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      targetAmount: "",
      deadline: null,
      note: "",
    },
    mode: "onSubmit",
  });

  const [saving, setSaving] = React.useState(false);

  // Prefill / reset on open
  React.useEffect(() => {
    if (!open) return;

    setSaving(false);

    if (!goal) {
      form.reset({
        name: "",
        targetAmount: "",
        deadline: null,
        note: "",
      });
      return;
    }

    form.reset({
      name: goal.name,
      targetAmount: fromMinorByCurrency(goal.targetAmountMinor, currency),
      deadline: goal.deadline ?? null,
      note: goal.note ?? "", // no note field in goal model yet
    });
  }, [open, goal, form, currency]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    form.clearErrors("name");
    form.clearErrors("targetAmount");
    form.clearErrors("deadline");

    const name = values.name.trim();
    if (!name) {
      form.setError("name", { type: "validate", message: "Введите название" });
      return;
    }

    const targetAmountMinor = toMinorByCurrency(values.targetAmount, currency);
    if (targetAmountMinor == null || targetAmountMinor <= 0) {
      form.setError("targetAmount", {
        type: "validate",
        message: "Введите сумму больше нуля",
      });
      return;
    }

    const deadline = values.deadline ?? null;
    const note = values.note?.trim() ?? "";

    setSaving(true);
    try {
      if (!isEdit) {
        const input: CreateGoalInput = {
          name,
          targetAmountMinor: targetAmountMinor,
          currentAmountMinor: 0,
          currency: currency,
          deadline,
          note,
          status: "active",
        };

        await onCreate(input);
      } else {
        const input: UpdateGoalInput = {
          id: goal!.id,
          patch: {
            name,
            targetAmountMinor: targetAmountMinor,
            deadline,
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

  return (
    <BottomSheet
      open={open}
      title={
        <ModalHeader title={isEdit ? "Edit goal" : "New goal"} onClose={onClose} />
      }
      height="half"
      onClose={onClose}
      footer={
        <ButtonBase
          fullWidth
          onClick={form.handleSubmit(onSubmit)}
          disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </ButtonBase>
      }
    >
      <FormProvider {...form}>
        <div className={styles.form}>
          <FormFieldString<FormValues>
            name="name"
            label="Name"
            placeholder="e.g. Emergency fund"
            rules={{ required: "Введите название" }}
          />

          <FormFieldString<FormValues>
            name="targetAmount"
            label="Target amount"
            placeholder="0"
            rightSlot={currency}
            rules={{
              required: "Введите сумму",
              validate: (v) => {
                if (!v) return "Введите сумму";
                const minor = toMinorByCurrency(v, currency);
                if (minor == null || minor <= 0) return "Введите сумму больше нуля";
                return true;
              },
            }}
          />

          <FormFieldDate<FormValues>
            name="deadline"
            label="Deadline (optional)"
            rules={{
              validate: (v) => {
                if (!v) return true;
                return /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : "Некорректная дата";
              },
            }}
          />

          <FormFieldString<FormValues>
            name="note"
            label="Note (optional)"
            placeholder="Add a note"
            multiline={true}
          />
        </div>
      </FormProvider>
    </BottomSheet>
  );
}

GoalUpsertSheet.displayName = "GoalUpsertSheet";
export default GoalUpsertSheet;