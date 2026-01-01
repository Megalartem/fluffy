import React from "react";
import clsx from "clsx";
import styles from "./FormField.module.css";
import { Text } from "@/shared/ui/atoms";

type FieldType = 'string' | 'number' | 'select';

export interface FormFieldBaseProps {
  fieldType?: FieldType;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement;
}

export const FormFieldBase: React.FC<FormFieldBaseProps> = ({
  fieldType = 'string',
  label,
  helperText,
  error,
  required = false,
  className,
  children,
}) => {
  const reactId = React.useId();
  const id = (children.props as { id?: string }).id ?? `ff_${reactId}`;
  const hintId = helperText || error ? `${id}__hint` : undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": hintId,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <div 
    data-variant={fieldType}
    className={clsx(styles.root, className)}
    >
      {label ? (
        <label htmlFor={id} className={styles.label}>
          <Text variant="label">{label}</Text>
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {control}

      {error ? (
        <div id={hintId} className={styles.error} role="alert">
          <Text variant="caption">{error}</Text>
        </div>
      ) : helperText ? (
        <div id={hintId}>
          <Text variant="caption">{helperText}</Text>
        </div>
      ) : null}
    </div>
  );
};

FormFieldBase.displayName = "FormFieldBase";