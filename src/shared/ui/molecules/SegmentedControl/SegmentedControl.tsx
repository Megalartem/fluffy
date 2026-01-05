import React, { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./SegmentedControl.module.css";
import { ButtonBase, Heading } from "@/shared/ui/atoms";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: "s" | "m";
  className?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  size = "m",
  className,
  disabled = false,
}: SegmentedControlProps<T>) {
  // Local mirror so the selector moves instantly even if parent updates state asynchronously
  const [localValue, setLocalValue] = useState<T>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const activeIndex = Math.max(0, options.findIndex((o) => o.value === localValue));

  return (
    <div
      className={clsx(
        styles.root,
        size === "s" ? styles.s : styles.m,
        disabled && styles.disabled,
        className
      )}
      role="tablist"
      aria-disabled={disabled || undefined}
      style={
        {
          // CSS custom props for indicator positioning
          "--sc-count": String(options.length),
          "--sc-index": String(activeIndex),
        } as React.CSSProperties
      }
    >
      <div className={styles.indicator} aria-hidden="true" />

      {options.map((opt) => {
        const isActive = opt.value === localValue;

        return (
          <ButtonBase
            key={opt.value}
            type="button"
            size={size}
            variant="ghost"
            className={styles.item}
            onClick={() => {
              if (disabled) return;
              setLocalValue(opt.value);
              onChange(opt.value);
            }}
            disabled={disabled}
            aria-pressed={isActive}
          >
            <Heading
              as="span"
              className={clsx(styles.label, isActive && styles.labelActive)}
            >
              {opt.label}
            </Heading>
          </ButtonBase>
        );
      })}
    </div>
  );
}