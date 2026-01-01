"use client";

import React from "react";
import clsx from "clsx";
import styles from "./FilterControl.module.css";
import { FormNumberField, FormSelectField } from "@/shared/ui/molecules";

export type FilterValue = string | number | boolean | null | string[];

export type FilterValues = Record<string, FilterValue>;

export type SelectMode = "single" | "multi";

export type FilterOption =
  | {
    key: string;
    label: string;
    type: "number";
    placeholder?: string;
  }
  | {
    key: string;
    label: string;
    type: "select";
    mode?: SelectMode; // default: single
    placeholder?: string;
    options: { value: string; label: string }[];
    /** Optional custom value renderer (e.g., icon + text for categories). */
    renderValue?: (args: {
      mode: SelectMode;
      value: string | string[] | null;
      labels: string[];
    }) => React.ReactNode;
  };

export interface FilterControlProps {
  options: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** Called when user clicks a select field; parent should open OptionSheet. */
  onOpenSelect: (key: string) => void;
  className?: string;
}

export function FilterControl({
  options,
  values,
  onChange,
  onOpenSelect,
  className,
}: FilterControlProps) {
  const handleChange = (key: string, value: FilterValue) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const handleNumberChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      handleChange(key, null);
      return;
    }
    const next = Number(raw);
    handleChange(key, Number.isNaN(next) ? null : next);
  };

  function getSelectDisplay(option: Extract<FilterOption, { type: "select" }>) {
    const mode: SelectMode = option.mode ?? "single";
    const current = values[option.key];

    const selectedValues: string[] =
      mode === "multi"
        ? (Array.isArray(current) ? (current as string[]) : [])
        : (typeof current === "string" ? [current] : []);

    const labels = selectedValues
      .map((v) => option.options.find((o) => o.value === v)?.label)
      .filter(Boolean) as string[];


    // Default text UI (can be overridden via renderValue)
    const defaultNode =
      mode === "multi"
        ? `${selectedValues.length} выбрано`
        : (labels[0] ?? option.placeholder ?? "Выберите…");

    const node = option.renderValue
      ? option.renderValue({
        mode,
        value: mode === "multi" ? selectedValues : (selectedValues[0] ?? null),
        labels,
      })
      : defaultNode;

    const placeholder = option.placeholder ?? "Выберите…";

    return { mode, node, placeholder };
  }

  return (
    <div className={clsx(styles.root, className)}>
      {options.map((option) => {
        if (option.type === "select") {
          const { mode, node, placeholder } = getSelectDisplay(option);

          return (
            <FormSelectField
              key={option.key}
              label={option.label}
              mode={mode}
              value={node}
              placeholder={placeholder}
              onClick={() => onOpenSelect(option.key)}
            />
          );
        }

        const current = values[option.key];
        const numberString = typeof current === "number" ? String(current) : "";

        return (
          <FormNumberField
            key={option.key}
            label={option.label}
            value={numberString}
            onChange={handleNumberChange(option.key)}
            helperText={option.placeholder}
          />
        );
      })}
    </div>
  );
}