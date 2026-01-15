

import React from "react";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { SegmentedControl } from "@/shared/ui/molecules";
import { FormFieldBase, type FormFieldBaseProps } from "./FormFieldBase";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

export type IFormFieldSegment<
  TFormValues extends FieldValues,
  TValue extends string
> = Omit<FormFieldBaseProps, "children" | "fieldType" | "error"> & {
  /** RHF field name */
  name: FieldPath<TFormValues>;
  /** RHF validation rules */
  rules?: RegisterOptions<TFormValues>;

  /** Segmented options */
  options: Array<SegmentOption<TValue>>;

  /** SegmentedControl size */
  size?: "s" | "m";

  /** Optional mapping in case you store values not exactly equal to option values */
  normalizeIn?: (value: unknown) => TValue;
  normalizeOut?: (value: TValue) => unknown;

  disabled?: boolean;
};

export function FormFieldSegment<
  TFormValues extends FieldValues,
  TValue extends string
>({
  name,
  rules,
  options,
  size = "m",
  normalizeIn,
  normalizeOut,
  disabled,
  ...base
}: IFormFieldSegment<TFormValues, TValue>) {
  const { control } = useFormContext<TFormValues>();
  const { field, fieldState } = useController({ control, name, rules });

  const error = fieldState.error?.message;
  const value = (normalizeIn
    ? normalizeIn(field.value)
    : (field.value as TValue)) ?? options[0]?.value;

  return (
    <FormFieldBase {...base} fieldType="select" error={error}>
      <div>
        <SegmentedControl
          value={value}
          size={size}
          options={options}
          onChange={(next) =>
            field.onChange(normalizeOut ? normalizeOut(next) : next)
          }
          disabled={disabled}
        />
      </div>
    </FormFieldBase>
  );
}

FormFieldSegment.displayName = "FormFieldSegment";