import React from "react";
import { InputBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

export interface FormNumberFieldProps extends Omit<FormFieldBaseProps, "children"> {
  /** UI value as string to allow empty state */
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function FormNumberField({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  ...base
}: FormNumberFieldProps) {
  return (
    <FormFieldBase error={error} {...base} fieldType="number">
      <InputBase
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        state={error ? "error" : disabled ? "disabled" : "default"}
        disabled={disabled}
      />
    </FormFieldBase>
  );
}