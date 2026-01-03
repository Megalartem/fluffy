import React from "react";
import clsx from "clsx";
import styles from "./SelectBase.module.css";
import { ChevronDown } from "lucide-react";

type InputState = "default" | "focused" | "error" | "disabled";

export interface SelectBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  children: React.ReactNode;
  ariaHaspopup?: "listbox" | "dialog" | "menu" | "tree" | "grid";
  /** Whether the trigger has a selected value (affects data-empty for styling). */
  hasValue?: boolean;
  "data-variant"?: string;
  ariaLabel?: string;
  showChevron?: boolean;
  isOpen?: boolean;
}

export function SelectBase({
  state = "default",
  className = "",
  ariaHaspopup,
  children,
  hasValue = false,
  ariaLabel,
  showChevron = true,
  isOpen = false,
  ...props
}: SelectBaseProps) {
  const dataVariant = props["data-variant"] ?? "select";
  const isDisabled = Boolean(props.disabled) || state === "disabled";

  return (
    <button
      {...props}
      type="button"
      disabled={isDisabled}
      data-state={state}
      data-variant={dataVariant}
      data-empty={!hasValue ? "true" : undefined}
      aria-invalid={state === "error" ? true : undefined}
      aria-haspopup={ariaHaspopup ?? "dialog"}
      aria-label={ariaLabel}
      className={clsx(styles.input, className)}
    >
      {children}
      { showChevron && <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} /> }
    </button>
  );
}

SelectBase.displayName = "SelectBase";
