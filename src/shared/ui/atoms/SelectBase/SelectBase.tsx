import React from "react";
import clsx from "clsx";
import styles from "./SelectBase.module.css";

type SelectState = "default" | "focused" | "error" | "disabled";

export interface SelectBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: SelectState;
  children: React.ReactNode;
  ariaHaspopup?: "listbox" | "dialog" | "menu" | "tree" | "grid";
  /** Whether the trigger has a selected value (affects data-empty for styling). */
  hasValue?: boolean;
  "data-variant"?: string;
  ariaLabel?: string
  disabled?: boolean;
}

export function SelectBase({
  state = "default",
  className = "",
  ariaHaspopup,
  children,
  hasValue = false,
  ariaLabel,
  disabled = false,
  ...props
}: SelectBaseProps) {
  const dataVariant = props["data-variant"] ?? "select";
  const isDisabled = Boolean(disabled) || state === "disabled";

  return (
    <button
      type="button"
      disabled={isDisabled}
      data-state={state}
      data-variant={dataVariant}
      data-empty={!hasValue ? "true" : undefined}
      aria-invalid={state === "error" ? true : undefined}
      aria-haspopup={ariaHaspopup ?? "dialog"}
      aria-label={ariaLabel}
      className={clsx(styles.input, className)}
      {...props}
    >
      {children}
    </button>
  );
}

SelectBase.displayName = "SelectBase";
