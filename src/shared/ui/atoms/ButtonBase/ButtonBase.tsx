import React from "react";
import styles from "./ButtonBase.module.css";

export type ButtonSize = "s" | "m";
export type ButtonVariant = "default" | "muted" | "ghost";

type ButtonState = "default" | "pressed";

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  pressed?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export function ButtonBase({
  size = "m",
  variant = "default",
  pressed = false,
  className = "",
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick = () => {},
  ariaLabel = undefined,
  ...props
}: ButtonBaseProps) {
  const state: ButtonState = pressed ? "pressed" : "default";

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      data-size={size}
      data-variant={variant}
      data-state={state}
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        styles.button, 
        fullWidth ? styles.fullWidth : "", 
        className].filter(Boolean).join(" ")}
    />
  );
}

ButtonBase.displayName = "ButtonBase";
