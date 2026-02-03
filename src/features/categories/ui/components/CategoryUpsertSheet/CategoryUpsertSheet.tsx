"use client";

import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";

import styles from "./CategoryUpsertSheet.module.css";

import type {
  Category,
  CategoryType,
  CategoryColor,
  CreateCategoryInput,
  UpdateCategoryPatch,
} from "@/features/categories/model/types";

import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";
import { ButtonBase } from "@/shared/ui/atoms";

import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldSegment } from "@/shared/ui/molecules/FormField/FormFieldSegment";
import { type IconName } from "lucide-react/dynamic";
import { FormFieldCategoryAppearance } from "../CategoryAppearance/FormFieldCategoryAppearance";
import { CategoryChooseIconSheet } from "../CategoryChooseIconSheet/CategoryChooseIconSheet";

export type UpdateCategoryInput = {
  id: string;
  patch: UpdateCategoryPatch;
};

export interface CategoryUpsertSheetProps {
  open: boolean;
  onClose: () => void;

  workspaceId: string;

  /** если передали initial — edit mode */
  initial?: Category;

  onCreate: (input: CreateCategoryInput) => Promise<void> | void;
  onUpdate: (input: UpdateCategoryInput) => Promise<void> | void;
}

type FormValues = {
  name: string;
  type: CategoryType;

  // optional fields (можно убрать из UI позже)
  iconKey: string; // IconName, но в форме проще как string
  colorKey: CategoryColor;
};

const TYPE_OPTIONS: Array<{ value: CategoryType; label: string }> = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

export function CategoryUpsertSheet({
  open,
  onClose,
  initial,
  onCreate,
  onUpdate,
}: CategoryUpsertSheetProps) {
  const isEdit = Boolean(initial);
  const [saving, setSaving] = React.useState(false);
  const [isChooseIconSheetOpen, setIsChooseIconSheetOpen] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "expense",
      iconKey: "piggy-bank",
      colorKey: "blue",
    },
    mode: "onSubmit",
  });

  // Prefill/reset on open
  React.useEffect(() => {
    if (!open) return;

    setSaving(false);

    if (!initial) {
      form.reset({
        name: "",
        type: "expense",
        iconKey: "piggy-bank",
        colorKey: "coral",
      });
      return;
    }

    form.reset({
      name: initial.name,
      type: initial.type,
      iconKey: initial.iconKey,
      colorKey: initial.colorKey,
    });
  }, [open, initial, form]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    form.clearErrors("name");

    const name = values.name.trim();
    if (!name) {
      form.setError("name", { type: "validate", message: "Введите название" });
      return;
    }

    setSaving(true);
    try {
      if (!isEdit) {
        const input: CreateCategoryInput = {
          // если твой CreateCategoryInput включает workspaceId — убери эту строку
          // но по хорошему он должен быть без workspaceId, как мы обсуждали
          name,
          type: values.type,
          iconKey: values.iconKey as IconName,
          colorKey: values.colorKey,
          order: 0, // сервис выставит корректно (max+10). если нет — сделай тут.
        } as unknown as CreateCategoryInput;

        await onCreate(input);
      } else {
        const patch: UpdateCategoryPatch = {
          name,
          // тип можно разрешить менять — зависит от решения. Я включаю:
          type: values.type,
          iconKey: values.iconKey as IconName,
          colorKey: values.colorKey,
        };

        await onUpdate({ id: initial!.id, patch });
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
        <ModalHeader
          title={isEdit ? "Edit category" : "New category"}
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
          {/* Category name */}
          <FormFieldString<FormValues>
            name="name"
            label="Name"
            placeholder="Например: Еда"
            rules={{
              required: "Введите название",
              validate: (v) => (v.trim() ? true : "Введите название"),
            }}
          />

          {/* Category type */}
          <FormFieldSegment<FormValues, CategoryType>
            name="type"
            label="Type"
            options={TYPE_OPTIONS}
            size="m"
          />

          {/* Category appearance (icon & color) */}
          <FormFieldCategoryAppearance<FormValues>
            iconFieldName="iconKey"
            colorFieldName="colorKey"
            onIconClick={React.useCallback(() => setIsChooseIconSheetOpen(true), [])}
          />

          {/* Icon picker sheet */}
          <CategoryChooseIconSheet
            isOpen={isChooseIconSheetOpen}
            iconKey={form.watch("iconKey") as IconName}
            onSubmit={(nextIconKey) => {
              if (nextIconKey) {
                form.setValue("iconKey", nextIconKey, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
            onClose={() => setIsChooseIconSheetOpen(false)}
          />
        </div>
      </FormProvider>
    </BottomSheet >
  );
}

export default CategoryUpsertSheet;