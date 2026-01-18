import React from "react";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Popover,
  Button as AriaButton,
  Heading as AriaHeading,
} from "react-aria-components";
import { parseDate, type CalendarDate } from "@internationalized/date";

import { FormFieldBase, type FormFieldBaseProps } from "./FormFieldBase";

import clsx from "clsx";
import styles from "./FormField.module.css";
import { Icon } from "../../atoms";
import { Calendar as CalendarIcon } from "lucide-react";

export type FormFieldDateValue = string | null;

export type IFormFieldDate<TFormValues extends FieldValues> = Omit<
  FormFieldBaseProps,
  "children" | "fieldType" | "error"
> & {
  /** RHF field name. Stored as YYYY-MM-DD (string) or null */
  name: FieldPath<TFormValues>;
  /** RHF validation rules */
  rules?: RegisterOptions<TFormValues>;

  /** Optional min/max bounds as YYYY-MM-DD */
  min?: string;
  max?: string;

  disabled?: boolean;
  state?: "default" | "error" | "disabled";
};

/**
 * RHF-first Date field using React Aria DatePicker.
 *
 * Stores value in RHF as `YYYY-MM-DD | null`.
 * Must be used inside `<FormProvider>`.
 */
export function FormFieldDate<TFormValues extends FieldValues>({
  name,
  rules,
  min,
  max,
  disabled,
  state,
  ...base
}: IFormFieldDate<TFormValues>) {
  const { control } = useFormContext<TFormValues>();
  const { field, fieldState } = useController({ control, name, rules });

  const error = fieldState.error?.message;

  const visualState: "default" | "error" | "disabled" = error
    ? "error"
    : disabled || state === "disabled"
      ? "disabled"
      : "default";

  const value: CalendarDate | null =
    typeof field.value === "string" && field.value
      ? parseDate(field.value)
      : null;

  const minValue = min ? parseDate(min) : undefined;
  const maxValue = max ? parseDate(max) : undefined;

  return (
    <FormFieldBase {...base} fieldType="string" error={error}>
      {/*
        NOTE: FormFieldBase clones its child and applies id/aria-* attributes.
        We wrap the actual DatePicker in a <div> so it can safely receive those props.
      */}
      <div className={styles.control}>
        <DatePicker
          aria-label={base.label ?? name}
          value={value}
          onChange={(next: CalendarDate | null) => {
            // next is CalendarDate | null
            field.onChange(next ? next.toString() : null);
          }}
          isDisabled={visualState === "disabled"}
          minValue={minValue}
          maxValue={maxValue}
          granularity="day"
          className={clsx(styles.datePicker, error && styles.datePickerError)}
        >
          <Group className={styles.dateGroup}>
            <DateInput className={styles.dateInput} data-state={visualState}>
              {(segment: Parameters<Parameters<typeof DateInput>[0]['children']>[0]) => (
                <DateSegment segment={segment} className={styles.dateSegment} />
              )}
            </DateInput>
            <AriaButton
              className={styles.dateButton}
              aria-label="Open calendar"
              type="button"
              data-state={visualState}
            >
              <Icon icon={CalendarIcon} size="s" variant={visualState === "error" ? "accent" : "default"} /> 
            </AriaButton>
          </Group>

          <Popover className={styles.datePopover}>
            <Dialog className={styles.dateDialog}>
              <Calendar className={styles.calendar}>
                <header className={styles.calendarHeader}>
                  <AriaButton
                    className={styles.calendarNavButton}
                    slot="previous"
                    aria-label="Previous month"
                    type="button"
                  >
                    ‹
                  </AriaButton>
                  <AriaHeading
                    className={styles.calendarHeading}
                    slot="heading"
                  />
                  <AriaButton
                    className={styles.calendarNavButton}
                    slot="next"
                    aria-label="Next month"
                    type="button"
                  >
                    ›
                  </AriaButton>
                </header>

                <CalendarGrid className={styles.calendarGrid}>
                  {(date: CalendarDate) => (
                    <CalendarCell
                      className={styles.calendarCell}
                      date={date}
                    />
                  )}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          </Popover>
        </DatePicker>  </div>
    </FormFieldBase>
  );
}

FormFieldDate.displayName = "FormFieldDate";