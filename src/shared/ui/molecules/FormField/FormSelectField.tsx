import React from "react";
import { Heading, OptionBaseProps, SelectBase } from "@/shared/ui/atoms";
import styles from "./FormField.module.css";
import { FormFieldBase, FormFieldBaseProps } from "./FormFieldBase";
import { ChevronDown } from "lucide-react";
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
  ...base
}: FormSelectFieldProps) {



  return (
    <FormFieldBase error={error} {...base} fieldType="select">
      <SelectBase
        onClick={onClick}
        hasValue={values !== undefined && values !== null && values.length > 0}
        data-value={values}
        state={error ? "error" : disabled ? "disabled" : "default"}
      >
        {
          values ? (
                values.length === 1 ? (
                  <div
                    className={styles.selectBody}
                    data-value={values[0].value}
                    >
                    {values[0].icon}
                    <Heading as="h2">{values[0].label}</Heading>
                  </div>
                ) : values.length > 1 ? (
                  <div className={styles.selectBody}>
                    {values.map((value) => (
                      <div
                        key={value.value}
                        className={styles.selectOptionLabels}
                      >
                        {value.icon}
                        <span>{value.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null
            )
            : placeholder
        }
        { showChevron && <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} /> }
      </SelectBase>
    </FormFieldBase>
  );
}