"use client";

import React from "react";
import clsx from "clsx";
import styles from "./FiltersSheet.module.css";
import { BottomSheet } from "@/shared/ui/molecules";

export function FiltersSheet({
  open,
  title = "Filters",
  onClose,
  dismissible = true,
  height = "auto",
  children,
  footer,
  className,
}: {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  height?: "auto" | "half" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <BottomSheet
      open={open}
      title={title}
      onClose={onClose}
      dismissible={dismissible}
      height={height}
      className={clsx(styles.sheet, className)}
    >
      <div className={styles.content}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </BottomSheet>
  );
}
