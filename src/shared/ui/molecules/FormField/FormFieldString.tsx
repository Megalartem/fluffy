import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { FormFieldBase } from "./FormFieldBase";
import { InputBase, type InputBaseProps } from "@/shared/ui/atoms/InputBase/InputBase";

type IFormFieldString<T extends FieldValues> = Omit<
  InputBaseProps,
  "name" | "defaultValue" | "inputRef"
> & {
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  required?: boolean;
  rules?: RegisterOptions<T>;
  fieldType?: "string" | "number" | "select";

  multiline?: boolean;
};

export function FormFieldString<T extends FieldValues>({
  name,
  label,
  helperText,
  required,
  rules,
  fieldType = "string",
  state,
  multiline = false,
  ...inputProps
}: IFormFieldString<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name, rules });

  const error = fieldState.error?.message;

  return (
    <FormFieldBase
      fieldType={fieldType}
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <InputBase
        {...inputProps}
        inputRef={field.ref}
        name={field.name}
        value={(field.value ?? "") as string}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange(e.target.value)}
        state={error ? "error" : state ?? "default"}
        multiline={multiline}
      />
    </FormFieldBase>
  );
}