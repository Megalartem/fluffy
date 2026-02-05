import React from "react";
import clsx from "clsx";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { Checkmark, Text } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";

export type IFormFieldCheckmark<TFormValues extends FieldValues> = {
  /** RHF field name */
  name: FieldPath<TFormValues>;
  /** RHF validation rules */
  rules?: RegisterOptions<TFormValues>;

  /** Label text displayed to the right of the checkbox */
  label: string;

  /** Helper text below the checkbox */
  helperText?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Additional CSS class */
  className?: string;
};

export function FormFieldCheckmark<TFormValues extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  disabled,
  className,
}: IFormFieldCheckmark<TFormValues>) {
  const { control } = useFormContext<TFormValues>();
  const { field, fieldState } = useController({ control, name, rules });

  const error = fieldState.error?.message;
  const checked = Boolean(field.value);

  const reactId = React.useId();
  const id = React.useMemo(() => `checkmark_${reactId}`, [reactId]);
  const hintId = React.useMemo(
    () => (helperText || error ? `${id}__hint` : undefined),
    [helperText, error, id]
  );

  const handleChange = React.useCallback(() => {
    field.onChange(!checked);
  }, [field, checked]);

  const hasError = Boolean(error);
  const showHint = Boolean(helperText || error);

  return (
    <div className={clsx(styles.checkmarkRoot, className)}>
      <label htmlFor={id} className={styles.checkmarkLabel}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          aria-invalid={hasError || undefined}
          aria-describedby={hintId}
        />
        <Checkmark checked={checked} />
        <Text variant="body" className={styles.checkmarkLabelText}>
          {label}
        </Text>
      </label>

      {showHint && (
        <div id={hintId} className={styles.checkmarkHint}>
          <Text
            variant="body"
            className={error ? styles.error : styles.helperText}
          >
            {error || helperText}
          </Text>
        </div>
      )}
    </div>
  );
}

FormFieldCheckmark.displayName = "FormFieldCheckmark";
