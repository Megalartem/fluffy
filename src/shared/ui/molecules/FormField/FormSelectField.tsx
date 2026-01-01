import React from "react";
import { SelectBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

type SelectMode = "single" | "multi";

export interface FormSelectFieldProps extends Omit<FormFieldBaseProps, "children"> {
  mode: SelectMode;
  onClick: () => void;
  disabled?: boolean;
  value?: string | React.ReactNode;
  // single
  valueLabel?: string | null;
  // multi
  selectedCount?: number;
  // общий
  placeholder?: string; // например: "Все категории"
}

export function FormSelectField({
  mode, // TODO: использовать в будущем для multi-select
  value,
  placeholder = "Choose...",
  onClick,
  disabled,
  error,
  ...base
}: FormSelectFieldProps) {
  return (
    <FormFieldBase error={error} {...base} fieldType="select">
      <SelectBase
        onClick={onClick}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {value ?? placeholder}
      </SelectBase>
    </FormFieldBase>
  );
}