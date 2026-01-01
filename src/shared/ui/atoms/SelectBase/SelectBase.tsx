import React from "react";
import clsx from "clsx";
import styles from "./SelectBase.module.css";

type InputState = "default" | "focused" | "error" | "disabled";

export interface SelectBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  children: React.ReactNode;
  ariaHaspopup?: "listbox" | "dialog" | "menu" | "tree" | "grid";}

export function SelectBase({
  state = "default",
  className = "",
  ariaHaspopup,
  children,
  ...props
}: SelectBaseProps) {

  return (
    <button
      {...props}
      type="button"
      disabled={state === "disabled"}
      data-state={state}
      aria-invalid={state === "error" ? true : undefined}
      aria-haspopup={ariaHaspopup ?? "dialog"}
      className={clsx(styles.input, className)}
    >
      {children}
    </button>
  );
}

SelectBase.displayName = "SelectBase";
