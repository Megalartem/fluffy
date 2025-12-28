"use client";

import React from "react";
import clsx from "clsx";
import styles from "./SortSheet.module.css";
import { BottomSheet } from "@/shared/ui/molecules";

export function SortSheet({
  open,
  title = "Сортировка",
  onClose,
  dismissible = true,
  children,
  className,
}: {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BottomSheet
      open={open}
      title={title}
      onClose={onClose}
      dismissible={dismissible}
      height="auto"
      className={clsx(styles.sheet, className)}
    >
      <div className={styles.content}>{children}</div>
    </BottomSheet>
  );
}