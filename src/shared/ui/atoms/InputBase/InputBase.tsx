import React from "react";
import styles from "./InputBase.module.css";
import { on } from "events";

type InputState = "default" | "focused" | "error" | "disabled";

interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Convenience flag for error state. */
  error?: boolean;
}

export function InputBase({
  state = "default",
  error = false,
  disabled = false,
  className = "",
  onChange,
  ...props
}: InputBaseProps) {
  const currentState: InputState = disabled
    ? "disabled"
    : error
      ? "error"
      : state;

  return (
    <input
      {...props}
      disabled={disabled}
      data-state={currentState}
      onChange={onChange}
      aria-invalid={currentState === "error" ? true : undefined}
      className={[styles.input, className].filter(Boolean).join(" ")}
    />
  );
}

InputBase.displayName = "InputBase";
