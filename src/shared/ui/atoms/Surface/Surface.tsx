import React from "react";
import styles from "./Surface.module.css";

export type SurfaceVariant = "default" | "ghost";
export type SurfaceBgVariant = "default" | "white";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  bgVariant?: SurfaceBgVariant;
  children?: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  variant = "default",
  bgVariant = "default",
  className = "",
  ...props
}) => {
  return (
    <div
      data-variant={variant}
      data-bg-variant={bgVariant}
      className={[styles.surface, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Surface.displayName = "Surface";
