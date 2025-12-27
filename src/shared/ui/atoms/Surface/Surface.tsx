import React from "react";
import styles from "./Surface.module.css";

export type SurfaceVariant = "default" | "ghost";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  children?: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  return (
    <div
      data-variant={variant}
      className={[styles.surface, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Surface.displayName = "Surface";
