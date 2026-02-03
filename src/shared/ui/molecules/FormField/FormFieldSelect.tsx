import React, { useEffect, useMemo, useState } from "react";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { Heading, Icon, type IOptionBase, SelectBase } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";
import { FormFieldBase, type FormFieldBaseProps } from "./FormFieldBase";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";

type SelectMode = "single" | "multi";

export type FormSelectValue = string | null | string[];

export interface IFormFieldSelect<T extends FieldValues>
  extends Omit<FormFieldBaseProps, "children" | "error" | "fieldType"> {
  /** RHF field name */
  name: FieldPath<T>;
  /** RHF validation rules */
  rules?: RegisterOptions<T>;

  mode: SelectMode;
  /** Open picker (BottomSheet / Modal) */
  onOpen: () => void;

  disabled?: boolean;
  /** Rendered when hasValue=false */
  placeholder?: React.ReactNode;

  showChevron?: boolean;
  isOpen?: boolean;

  /** Map stored ids -> UI option (label/icon) */
  optionsByValue: Record<string, IOptionBase>;

  /** Allow removing selected values from chips (multi only) */
  removable?: boolean;
  className?: string;
}

export function FormFieldSelect<T extends FieldValues>({
  name,
  rules,
  mode,
  onOpen,
  disabled,
  placeholder = "Choose...",
  showChevron = true,
  isOpen = false,
  optionsByValue,
  removable = false,
  className,
  ...base
}: IFormFieldSelect<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name, rules });
  const error = fieldState.error?.message;

  const values: IOptionBase[] | null = useMemo(() => {
    const raw = field.value as FormSelectValue;

    if (mode === "single") {
      const id = raw == null ? null : String(raw);
      const opt = id ? optionsByValue[id] : undefined;
      return opt ? [opt] : null;
    }

    // multi
    const ids = Array.isArray(raw) ? raw : [];
    const opts = ids
      .map((v) => optionsByValue[String(v)])
      .filter(Boolean) as IOptionBase[];
    return opts;
  }, [field.value, mode, optionsByValue]);

  const EXIT_MS = 160;
  const [leaving, setLeaving] = useState<Record<string, true>>({});

  useEffect(() => {
    const existing = new Set((values ?? []).map((v) => String(v.value)));

    queueMicrotask(() => {
      setLeaving((prev) => {
        let changed = false;
        const next: Record<string, true> = {};

        for (const k of Object.keys(prev)) {
          if (existing.has(k)) next[k] = true;
          else changed = true;
        }

        return changed ? next : prev;
      });
    });
  }, [values]);

  function commitRemove(value: IOptionBase) {
    const raw = field.value as FormSelectValue;

    if (mode === "multi") {
      const ids = Array.isArray(raw) ? raw : [];
      const next = ids.filter((v) => String(v) !== String(value.value));
      field.onChange(next);
      return;
    }

    // single: clear
    field.onChange(null);
  }

  function handleRemoveChip(e: React.MouseEvent, value: IOptionBase) {
    e.stopPropagation();

    // by design: only multi has removable chips (keeps single UI simple)
    if (!removable || mode !== "multi") return;

    const key = String(value.value);
    if (leaving[key]) return;

    setLeaving((prev) => ({ ...prev, [key]: true }));

    window.setTimeout(() => {
      commitRemove(value);
      setLeaving((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, EXIT_MS);
  }

  const hasValue = Boolean(values && values.length > 0);

  return (
    <FormFieldBase
     error={error} {...base} fieldType="select" className={className}>
      <SelectBase
        onClick={onOpen}
        hasValue={hasValue}
        data-value={values}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {hasValue ? (
          mode === "single" ? (
            <div className={styles.selectBody} data-value={values![0].value}>
              {values![0].icon}
              <Heading as="h2">{values![0].label}</Heading>
            </div>
          ) : (
            <div className={styles.selectBody}>
              {values!.map((value) => {
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
                    {removable && mode === "multi" && (
                      <Icon icon={X} size="s" />
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          placeholder
        )}

        {showChevron && (
          <ChevronDown
            className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
          />
        )}
      </SelectBase>
    </FormFieldBase>
  );
}

FormFieldSelect.displayName = "FormFieldSelect";