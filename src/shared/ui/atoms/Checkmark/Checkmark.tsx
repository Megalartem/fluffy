import React from "react";
import { Check } from "lucide-react";
import styles from "./Checkmark.module.css";

interface CheckmarkProps extends React.HTMLAttributes<HTMLDivElement> {
  checked: boolean;
  size?: "s" | "m";
}

export const Checkmark: React.FC<CheckmarkProps> = ({
  checked,
  size = "m",
  className = "",
  ...props
}) => {
  return (
    <div
      data-checked={checked ? "true" : "false"}
      data-size={size}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      {checked ? <Check className={styles.icon} strokeWidth={3} /> : null}
    </div>
  );
};

Checkmark.displayName = "Checkmark";
