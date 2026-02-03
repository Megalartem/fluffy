import React, { useMemo } from "react";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { CategoryIcon, SelectBase, type IOptionBase } from "@/shared/ui/atoms";
import { FormFieldBase, type FormFieldBaseProps } from "./FormFieldBase";

import styles from "./FormField.module.css";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CategoryColor } from "@/features/categories/model/types";

type IconOption = Omit<IOptionBase, "value"> & { value: IconName };

export interface IFormFieldIconPicker<T extends FieldValues>
  extends Omit<FormFieldBaseProps, "children" | "error" | "fieldType"> {
  /** RHF field name */
  name: FieldPath<T>;
  /** RHF validation rules */
  rules?: RegisterOptions<T>;

  /** Open picker (BottomSheet / Modal) */
  onOpen: () => void;

  disabled?: boolean;

  showChevron?: boolean;
  isOpen?: boolean;

  /**
   * Map stored id -> UI option (label + icon)
   * icon тут как раз будет кнопка/превью (например <CategoryIcon .../>)
   */
  optionsByValue: Record<string, IconOption>;
  defaultValue: IconOption;
  className?: string;

  /** Optional UI color for the icon preview (passed as a data attribute) */
  dataColor?: CategoryColor;
}

export function FormFieldIconPicker<T extends FieldValues>({
  name,
  rules,
  onOpen,
  disabled,
  showChevron = false,
  isOpen = false,
  optionsByValue,
  defaultValue,
  className,
  dataColor,
  ...base
}: IFormFieldIconPicker<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name, rules });
  const error = fieldState.error?.message;

  const value: IconOption | null = useMemo(() => {
    const raw = field.value as unknown;
    const id = raw == null || raw === "" ? null : String(raw);
    return id ? (optionsByValue[id] ?? null) : null;
  }, [field.value, optionsByValue]);

  const hasValue = Boolean(value);

  const iconName = value?.value ?? defaultValue.value;
  
  return (
    <FormFieldBase
      error={error}
      {...base}
      fieldType="select"
    >
      <SelectBase
        onClick={onOpen}
        hasValue={hasValue}
        data-value={value ? [value] : [defaultValue]}
        state={error ? "error" : disabled ? "disabled" : "default"}
        className={className}
      >
        <div 
        className={styles.selectBodyIcon} 
        data-value={iconName}
        data-color={dataColor ?? "default"}
        >
          <DynamicIcon name={value!.value || defaultValue.value} size={20} />
        </div>

        {showChevron && (
          <ChevronDown
            className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
          />
        )}
      </SelectBase>
    </FormFieldBase>
  );
}

FormFieldIconPicker.displayName = "FormFieldIconPicker";