import React, { useEffect, useState } from "react";
import { Heading, Icon, OptionBaseProps, SelectBase } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";

type SelectMode = "single" | "multi";



export interface FormSelectFieldProps extends Omit<FormFieldBaseProps, "children"> {
  mode: SelectMode;
  onClick: () => void;
  disabled?: boolean;

  /** Rendered when hasValue=true (can be icon + text, chips, etc.) */
  values?: OptionBaseProps[] | null;
  /** Rendered when hasValue=false */
  placeholder?: React.ReactNode;
  error?: string;
  showChevron?: boolean;
  isOpen?: boolean;
  onRemoveValue?: (value: OptionBaseProps) => void;
}

export function FormSelectField({
  mode,
  values,
  placeholder = "Choose...",
  onClick,
  disabled,
  error,
  isOpen = false,
  showChevron = true,
  onRemoveValue,
  ...base
}: FormSelectFieldProps) {

  const EXIT_MS = 160;
  const [leaving, setLeaving] = useState<Record<string, true>>({});

  useEffect(() => {
    // Cleanup leaving flags for values that no longer exist (e.g., external reset)
    const existing = new Set((values ?? []).map((v) => String(v.value)));
    setLeaving((prev) => {
      let changed = false;
      const next: Record<string, true> = {};
      for (const key of Object.keys(prev)) {
        if (existing.has(key)) next[key] = true;
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [values]);

  function handleRemoveChip(e: React.MouseEvent, value: OptionBaseProps) {
    e.stopPropagation();
    if (!onRemoveValue) return;

    const key = String(value.value);
    if (leaving[key]) return;

    setLeaving((prev) => ({ ...prev, [key]: true }));

    window.setTimeout(() => {
      onRemoveValue(value);
      setLeaving((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
    }, EXIT_MS);
  }

  return (
    <FormFieldBase error={error} {...base} fieldType="select">
      <SelectBase
        onClick={onClick}
        hasValue={values !== undefined && values !== null && values.length > 0}
        data-value={values}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {
          values && values.length > 0 ? (
            mode === "single" ? (
              <div
                className={styles.selectBody}
                data-value={values[0].value}
              >
                {values[0].icon}
                <Heading as="h2">{values[0].label}</Heading>
              </div>
            ) : mode === "multi" ? (
              <div className={styles.selectBody}>
                {values.map((value) => {
                  const key = String(value.value);
                  return (
                    <div
                      key={value.value}
                      className={clsx(
                        styles.selectOptionLabels,
                        leaving[key] && styles.selectOptionLeaving
                      )}
                      data-leaving={leaving[key] ? "true" : undefined}
                      onClick={(e) => handleRemoveChip(e, value)}
                      
                    >
                      {value.icon}
                      <span>{value.label}</span>
                      {onRemoveValue && (
                        <Icon
                          icon={X}
                          size="s"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null
          )
            : placeholder
        }
        {showChevron && <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} />}
      </SelectBase>
    </FormFieldBase>
  );
}
FormSelectField.displayName = "FormSelectField";