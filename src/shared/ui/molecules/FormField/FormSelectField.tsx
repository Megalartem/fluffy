import React from "react";
import { Heading, Icon, SelectBase } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";
import { LucideIcon } from "lucide-react";

type SelectMode = "single" | "multi";

export interface FormValue {
  label: string;
  value: string;
  icon?: LucideIcon;
  iconSize?: "s" | "m" | "l";
}

export interface FormSelectFieldProps extends Omit<FormFieldBaseProps, "children"> {
  mode: SelectMode;
  onClick: () => void;
  disabled?: boolean;

  /** Rendered when hasValue=true (can be icon + text, chips, etc.) */
  value?: FormValue | FormValue[] | null;
  /** Rendered when hasValue=false */
  placeholder?: React.ReactNode;
  error?: string;
  isOpen?: boolean;
}

export function FormSelectField({
  mode,
  value,
  placeholder = "Choose...",
  onClick,
  disabled,
  error,
  isOpen = false,
  ...base
}: FormSelectFieldProps) {



  return (
    <FormFieldBase error={error} {...base} fieldType="select">
      <SelectBase
        onClick={onClick}
        hasValue={value !== undefined}
        data-value={value}
        isOpen={isOpen}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {
          value
            ? (
                mode === "single" && value && !Array.isArray(value) ? (
                  <div
                    className={styles.selectBody}
                    data-value={value.value}
                    >
                    {
                    value.icon 
                    ? <Icon icon={value.icon} size={value.iconSize ?? "m"} variant="muted"/> 
                    : null
                    }
                    <Heading as="h2">{value.label}</Heading>
                  </div>
                ) : mode === "multi" && Array.isArray(value) ? (
                  <div className={styles.selectBody}>
                    {value.map((val) => (
                      <div
                        key={val.value}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 6px",
                          borderRadius: 12,
                          backgroundColor: "var(--color-bg-secondary)",
                          fontSize: 12,
                        }}
                      >
                        {val.icon ? React.createElement(val.icon, { width: 12, height: 12, style: { marginRight: 4 } }) : null}
                        <span>{val.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null
            )
            : placeholder
        }
      </SelectBase>
    </FormFieldBase>
  );
}