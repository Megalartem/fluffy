import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./Icon.module.css";

export type IconVariant = "default" | "on-default" | "muted" | "accent" | "ghost";
export type IconSize = "s" | "m" | "l";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon | React.ReactElement;
  size?: IconSize;
  variant?: IconVariant;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = "m",
  variant = "default",
  className = "",
  ...props
}) => {
  return (
    <span
      data-size={size}
      data-variant={variant}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      {React.isValidElement(IconComponent) ? (
        IconComponent
      ) : (
        <IconComponent 
          className={styles.svg} 
          aria-hidden="true" 
        />
      )}
    </span>
  );
};

Icon.displayName = "Icon";
