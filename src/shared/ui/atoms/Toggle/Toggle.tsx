import React from "react";
import styles from "./Toggle.module.css";

interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      className={[styles.root, className].filter(Boolean).join(" ")}
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      aria-pressed={enabled}
      data-enabled={enabled ? "true" : "false"}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
};

Toggle.displayName = "Toggle";
