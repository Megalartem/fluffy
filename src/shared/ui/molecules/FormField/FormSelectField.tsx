import React from "react";
import { SelectBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

type SelectMode = "single" | "multi";

export interface FormSelectFieldProps extends Omit<FormFieldBaseProps, "children"> {
  mode: SelectMode;
  onClick: () => void;
  disabled?: boolean;

  /** Rendered when hasValue=true (can be icon + text, chips, etc.) */
  value?: React.ReactNode;
  /** Rendered when hasValue=false */
  placeholder?: React.ReactNode;

  /** Explicit flag: is there a selected value (single) / any selections (multi) */
  hasValue: boolean;
}

export function FormSelectField({
  mode,
  value,
  placeholder = "Choose...",
  onClick,
  disabled,
  error,
  hasValue,
  ...base
}: FormSelectFieldProps) {
  return (
    <FormFieldBase error={error} {...base} fieldType="select">
      <SelectBase
        onClick={onClick}
        hasValue={hasValue}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {hasValue ? value : placeholder}
      </SelectBase>
    </FormFieldBase>
  );
}