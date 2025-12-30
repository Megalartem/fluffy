import React from "react";
import styles from "./InputBase.module.css";

type InputState = "default" | "focused" | "error" | "disabled";

export interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Convenience flag for error state. */
}

export function InputBase({
  state = "default",
  className = "",
  onChange,
  ...props
}: InputBaseProps) {
  return (
    <input
      {...props}
      disabled={state === "disabled"}
      data-state={state}
      onChange={onChange}
      aria-invalid={state === "error" ? true : undefined}
      className={[styles.input, className].filter(Boolean).join(" ")}
    />
  );
}

InputBase.displayName = "InputBase";
