import React from "react";
import { InputBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

export interface FormStringFieldProps extends Omit<FormFieldBaseProps, "children"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function FormStringField({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  ...base
}: FormStringFieldProps) {
  return (
    <FormFieldBase 
    {...base}
    fieldType="string"
    error={error}>
      <InputBase
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        state={error ? "error" : disabled ? "disabled" : "default"}
        disabled={disabled}
      />
    </FormFieldBase>
  );
}