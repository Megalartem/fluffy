"use client";

import React from "react";
import clsx from "clsx";
import styles from "./OptionControl.module.css";
import { OptionBase, type OptionBaseProps } from "@/shared/ui/atoms";
import { ModalActions } from "@/shared/ui/molecules";

export type OptionMode = "single" | "multi";

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
   * - multi: вызывается сразу, если не передан onApply
   */
  onChange?: (next: OptionBaseProps[] | null) => void;

  /**
   * If provided in multi mode, OptionControl will keep a local draft and call onApply(draft).
   * This enables an "Apply" UX.
   */
  onApply?: (next: OptionBaseProps[]) => void;

  className?: string;
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
  onApply,
  className,
}: OptionControlProps) {
  const isApplyMode = mode === "multi" && typeof onApply === "function";

  // Normalize controlled selection into value(s)
  const controlledValues = React.useMemo(() => {
    if (!chosenOptions?.length) return [];
    if (mode === "single") return [chosenOptions[0].value];

    return Array.from(new Set(chosenOptions.map((o) => o.value)));
  }, [chosenOptions, mode]);

  // Draft values (only for apply-mode multi)
  const [draftValues, setDraftValues] = React.useState<string[]>(controlledValues);

  // Sync draft with controlled value changes
  React.useEffect(() => {
    if (isApplyMode) setDraftValues(controlledValues);
  }, [isApplyMode, controlledValues]);

  const activeValues = isApplyMode ? draftValues : controlledValues;
  
  // Use Set for O(1) lookup instead of O(n) array.includes
  const activeSet = React.useMemo(() => new Set(activeValues), [activeValues]);

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
        ? activeValues.filter((v) => v !== value)
        : [...activeValues, value];

      if (isApplyMode) {
        setDraftValues(nextValues);
      } else {
        onChange?.(mapValuesToOptions(nextValues, options));
      }
    },
    [mode, activeSet, activeValues, isApplyMode, optionsMap, options, onChange]
  );

  const handleReset = React.useCallback(() => {
    if (mode === "single") {
      onChange?.(null);
    } else if (isApplyMode) {
      setDraftValues([]);
    } else {
      onChange?.([]);
    }
  }, [mode, isApplyMode, onChange]);

  const handleApply = React.useCallback(() => {
    if (isApplyMode) {
      onApply?.(mapValuesToOptions(draftValues, options));
    }
  }, [isApplyMode, draftValues, options, onApply]);

  return (
    <div className={clsx(styles.root, className)}>
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

      {mode === "multi" && isApplyMode && (
        <div className={styles.footerSticky}>
          <ModalActions
            layout="row"
            secondary={{
              label: "Reset",
              onClick: handleReset,
              disabled: draftValues.length === 0,
            }}
            primary={{
              label: "Apply",
              onClick: handleApply,
            }}
          />
        </div>
      )}
    </div>
  );
}

OptionControl.displayName = "OptionControl";