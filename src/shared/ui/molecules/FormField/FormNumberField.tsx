import React from "react";
import { InputBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

export interface FormNumberFieldProps extends Omit<FormFieldBaseProps, "children"> {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function FormNumberField({ value, onChange, disabled, error, ...base }: FormNumberFieldProps) {
  return (
    <FormFieldBase 
    error={error} {...base}
    fieldType="number"
    >
      <InputBase
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        state={error ? "error" : disabled ? "disabled" : "default"}
        disabled={disabled}
      />
    </FormFieldBase>
  );
}