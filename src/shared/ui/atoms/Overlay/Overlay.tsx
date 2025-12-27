import React from "react";
import styles from "./Overlay.module.css";

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  onClick?: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  visible,
  onClick,
  className = "",
  ...props
}) => {
  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Overlay.displayName = "Overlay";
