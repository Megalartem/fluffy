import React from "react";
import styles from "./Divider.module.css";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className = "",
  ...props
}) => {
  return (
    <div
      role="separator"
      data-orientation={orientation}
      className={[styles.divider, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Divider.displayName = "Divider";
