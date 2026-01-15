"use client";

import React from "react";
import clsx from "clsx";
import styles from "./OptionControl.module.css";
import { OptionBase, type OptionBaseProps } from "@/shared/ui/atoms";

export type OptionMode = "single" | "multi";
export type BgColorVariant = "default" | "ghost";

/**
 * - `options` — это список всех доступных опций (value/label/icon/disabled)
 * - `chosenOptions` — выбранные опции (контролируемое состояние снаружи)
 *
 * Для single ожидаем 0..1 выбранную опцию.
 * Для multi — любое количество.
 */
export interface OptionControlProps {
  options: OptionBaseProps[];
  mode?: OptionMode; // default: single

  /** Controlled selected options from parent */
  chosenOptions: OptionBaseProps[] | null;

  /**
   * Immediate change handler:
   * - single: вызывается сразу при выборе
   * - multi: вызывается сразу при каждом изменении
   */
  onChange?: (next: OptionBaseProps[] | null) => void;

  className?: string;
  btnBgColorVariant?: BgColorVariant;
}

function mapValuesToOptions(values: string[], options: OptionBaseProps[]): OptionBaseProps[] {
  const valueSet = new Set(values);
  return options.filter((o) => valueSet.has(o.value));
}

export function OptionControl({
  options,
  mode = "single",
  chosenOptions,
  onChange,
  className,
  btnBgColorVariant = "default",
}: OptionControlProps) {
  // Normalize controlled selection into value(s)
  const controlledValues = React.useMemo(() => {
    if (!chosenOptions?.length) return [];
    if (mode === "single") return [chosenOptions[0].value];

    return Array.from(new Set(chosenOptions.map((o) => o.value)));
  }, [chosenOptions, mode]);
  
  // Use Set for O(1) lookup instead of O(n) array.includes
  const activeSet = React.useMemo(() => new Set(controlledValues), [controlledValues]);

  // Create options map for O(1) lookup
  const optionsMap = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options]
  );

  const handleSelect = React.useCallback(
    (value: string, disabled?: boolean) => {
      if (disabled) return;

      if (mode === "single") {
        const picked = optionsMap.get(value);
        onChange?.(picked ? [picked] : null);
        return;
      }

      // Multi mode toggle
      const nextValues = activeSet.has(value)
        ? controlledValues.filter((v) => v !== value)
        : [...controlledValues, value];

      onChange?.(mapValuesToOptions(nextValues, options));
    },
    [mode, activeSet, controlledValues, optionsMap, options, onChange]
  );

  return (
    <div className={clsx(styles.root, className, {
      [styles.ghost]: btnBgColorVariant === "ghost",
    })}>
      <div className={styles.list}>
        {options.map((opt) => (
          <OptionBase
            state={opt.state === "disabled" ? "disabled" : activeSet.has(opt.value) ? "active" : "default"} 
            key={opt.value}
            value={opt.value}
            label={opt.label}
            icon={opt.icon}
            onSelect={() => handleSelect(opt.value, opt.state === "disabled")}
          />
        ))}
      </div>
    </div>
  );
}

OptionControl.displayName = "OptionControl";