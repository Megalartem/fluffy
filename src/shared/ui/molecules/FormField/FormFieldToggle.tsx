import React from "react";
import clsx from "clsx";
import {
    useController,
    useFormContext,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

import { Toggle, Text } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";

export type IFormFieldToggle<TFormValues extends FieldValues> = {
    /** RHF field name */
    name: FieldPath<TFormValues>;
    /** RHF validation rules */
    rules?: RegisterOptions<TFormValues>;

    /** Label text displayed to the right of the toggle */
    label: string;

    /** Helper text below the toggle */
    helperText?: string;

    /** Disabled state */
    disabled?: boolean;

    /** Additional CSS class */
    className?: string;
};

export function FormFieldToggle<TFormValues extends FieldValues>({
    name,
    rules,
    label,
    helperText,
    disabled,
    className,
}: IFormFieldToggle<TFormValues>) {
    const { control } = useFormContext<TFormValues>();
    const { field, fieldState } = useController({ control, name, rules });

    const error = fieldState.error?.message;
    const enabled = Boolean(field.value);

    const reactId = React.useId();
    const id = React.useMemo(() => `toggle_${reactId}`, [reactId]);
    const hintId = React.useMemo(
        () => (helperText || error ? `${id}__hint` : undefined),
        [helperText, error, id]
    );

    const handleChange = React.useCallback(
        (newEnabled: boolean) => {
            field.onChange(newEnabled);
        },
        [field]
    );

    const hasError = Boolean(error);
    const showHint = Boolean(helperText || error);

    return (
        <div className={clsx(styles.toggleRoot, className)}>
            <label htmlFor={id} className={styles.toggleLabel}>
                <Text variant="body" className={styles.toggleLabelText}>
                    {label}
                    {showHint && (
                <div id={hintId} className={styles.toggleHint}>
                    <Text
                        variant="muted"
                        className={error ? styles.error : undefined}
                    >
                        {error || helperText}
                    </Text>
                </div>
            )}
                </Text>
                <Toggle
                    id={id}
                    enabled={enabled}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hintId}
                />
            </label>
        </div>
    );
}

FormFieldToggle.displayName = "FormFieldToggle";
