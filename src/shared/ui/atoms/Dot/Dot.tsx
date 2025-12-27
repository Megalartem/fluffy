import React from "react";
import styles from "./Dot.module.css";

export type DotSize = "s" | "m" | "l";
export type DotColorKey = "default" | "muted" | "success" | "warning" | "error";

interface DotProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DotSize;
  colorKey?: DotColorKey; // optional semantic color key
}

export const Dot: React.FC<DotProps> = ({
  size = "m",
  colorKey = "default",
  className = "",
  ...props
}) => {
  return (
    <div
      data-size={size}
      data-color={colorKey}
      className={[styles.dot, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Dot.displayName = "Dot";
