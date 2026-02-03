"use client";

import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";

import styles from "./CategoryUpsertSheet.module.css";

import { CATEGORY_COLOR_KEYS } from "@/features/categories/model/types";
import type {
  Category,
  CategoryType,
  CategoryColor,
  CreateCategoryInput,
  UpdateCategoryPatch,
} from "@/features/categories/model/types";

import { BottomSheet, FormFieldIconPicker, ModalHeader } from "@/shared/ui/molecules";
import { ButtonBase } from "@/shared/ui/atoms";

import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";
import { FormFieldSegment } from "@/shared/ui/molecules/FormField/FormFieldSegment";
import { FormFieldSelect } from "@/shared/ui/molecules/FormField/FormFieldSelect";
import type { IOptionBase } from "@/shared/ui/atoms";
import { iconNames, type IconName } from "lucide-react/dynamic";
import clsx from "clsx";

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

interface IOptionIcon extends IOptionBase {
  value: IconName;
}

const ICON_OPTIONS = iconNames.map((value) => ({ value, label: value })) satisfies IOptionIcon[];

const COLOR_OPTIONS = CATEGORY_COLOR_KEYS.map((value) => ({ value, label: value })) satisfies IOptionBase[];

export function CategoryUpsertSheet({
  open,
  onClose,
  initial,
  onCreate,
  onUpdate,
}: CategoryUpsertSheetProps) {
  const isEdit = Boolean(initial);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "expense",
      iconKey: "piggy-bank",
      colorKey: "blue",
    },
    mode: "onSubmit",
  });

  // Map options for FormFieldIconPicker
  const iconOptionsByValue = React.useMemo(
    () =>
      ICON_OPTIONS.reduce<Record<string, IOptionIcon>>((acc, o) => {
        acc[String(o.value)] = o;
        return acc;
      }, {}),
    []
  );

  const colorOptionsByValue = React.useMemo(
    () =>
      COLOR_OPTIONS.reduce<Record<string, IOptionBase>>((acc, o) => {
        acc[String(o.value)] = o;
        return acc;
      }, {}),
    []
  );

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

  console.log("form values", form.getValues());

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
          <div className={styles.rowSpacer} >

            {/* Category icon */}
            <FormFieldIconPicker<FormValues>
              name="iconKey"
              label="Icon"
              dataColor={form.getValues().colorKey}
              optionsByValue={iconOptionsByValue}
              defaultValue={iconOptionsByValue["piggy-bank"]}
              onOpen={() => {
                console.log("open icon picker");
              }}
              className={styles.iconPicker}
            /> 

            {/* Category color */}
            <FormFieldSelect<FormValues>
              name="colorKey"
              label="Color"
              mode="single"
              placeholder="Choose color"
              optionsByValue={colorOptionsByValue}
              showChevron
              onOpen={() => {
                console.log("open color picker");
              }}
              className={styles.fieldFullWidth}
            />
          </div>
        </div>
      </FormProvider>
    </BottomSheet >
  );
}

export default CategoryUpsertSheet;