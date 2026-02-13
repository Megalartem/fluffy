import React from "react";
import { Plus, type LucideIcon } from "lucide-react";
import styles from "./FAB.module.css";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon: IconComponent = Plus,
  className = "",
  label = "FAB",
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={[styles.fab, className].filter(Boolean).join(" ")}
    >
      <IconComponent className={styles.icon} aria-hidden="true" />
    </button>
  );
};

FAB.displayName = "FAB";
