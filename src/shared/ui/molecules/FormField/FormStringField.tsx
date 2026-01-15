import React from "react";
import { InputBase } from "@/shared/ui/atoms";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";

type InputType = "text" | "password" | "email" | "number" | "date" | "tel" | "url";

export interface FormStringFieldProps extends Omit<FormFieldBaseProps, "children"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: InputType;
}

export function FormStringField({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  type = "text",
  ...base
}: FormStringFieldProps) {
  return (
    <FormFieldBase 
    {...base}
    fieldType="string"
    error={error}>
      <InputBase
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        state={error ? "error" : disabled ? "disabled" : "default"}
        disabled={disabled}
      />
    </FormFieldBase>
  );
}