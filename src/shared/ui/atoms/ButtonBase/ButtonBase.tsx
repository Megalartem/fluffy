import React from "react";
import styles from "./ButtonBase.module.css";

type ButtonSize = "small" | "medium";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonState = "default" | "pressed";

interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  pressed?: boolean;
}

export function ButtonBase({
  size = "medium",
  variant = "primary",
  pressed = false,
  className = "",
  disabled = false,
  type = "button",
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
      className={[styles.button, className].filter(Boolean).join(" ")}
    />
  );
}

ButtonBase.displayName = "ButtonBase";
