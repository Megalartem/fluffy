import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./FAB.module.css";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
}

export const FAB: React.FC<FABProps> = ({
  icon: IconComponent,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      className={[styles.fab, className].filter(Boolean).join(" ")}
    >
      <IconComponent className={styles.icon} aria-hidden="true" />
    </button>
  );
};

FAB.displayName = "FAB";
