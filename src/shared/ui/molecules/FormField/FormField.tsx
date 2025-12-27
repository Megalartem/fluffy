import React from "react";
import clsx from "clsx";
import styles from "./FormField.module.css";
import { Text, InputBase } from "@/shared/ui/atoms";

export interface FormFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * The control (InputBase, Select, ToggleRow etc.).
   * Prefer passing an element with its own id. If not provided, FormField will generate one.
   */
  children: React.ReactElement;
}

function makeId() {
  return `ff_${Math.random().toString(36).slice(2, 10)}`;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  required = false,
  className,
  children,
  onChange,
}) => {
  const id = (children.props as { id?: string }).id ?? makeId();
  return (
    <div className={clsx(styles.root, className)}>
      {label ? (
        <label htmlFor={id} className={styles.label}>
          <Text variant="label">{label}</Text>
          {required ? <span className={styles.required} aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <InputBase
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={helperText || error ? `${id}__hint` : undefined}
        {...(children.props as object)}
        onChange={onChange}
       />

      {error ? (
        <div id={`${id}__hint`} className={styles.error} role="alert">
          <Text variant="caption">{error}</Text>
        </div>
      ) : helperText ? (
        <div id={`${id}__hint`}>
          <Text variant="caption">{helperText}</Text>
        </div>
      ) : null}
    </div>
  );
};

FormField.displayName = "FormField";