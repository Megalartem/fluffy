import React from "react";
import styles from "./Badge.module.css";
import clsx from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

Badge.displayName = "Badge";