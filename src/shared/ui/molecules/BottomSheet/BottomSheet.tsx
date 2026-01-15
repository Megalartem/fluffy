"use client";

import React, { useEffect, useId } from "react";
import clsx from "clsx";
import styles from "./BottomSheet.module.css";
import { Overlay } from "@/shared/ui/atoms";

export type BottomSheetHeight = "auto" | "half" | "full";

export interface BottomSheetProps {
  open: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  height?: BottomSheetHeight;
  className?: string;
}

export function BottomSheet({
  open,
  title,
  footer,
  children,
  onClose,
  dismissible = true,
  height = "auto",
  className,
}: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div className={styles.root}>
      <Overlay visible={open} onClick={dismissible ? onClose : undefined} />

      <div
        className={clsx(
          styles.sheet,
          height === "auto" && styles.auto,
          height === "half" && styles.half,
          height === "full" && styles.full,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        data-state="open"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handleWrap}>
          <div className={styles.handle} />
        </div>

        {title ? (
          <div id={titleId} className={styles.header}>
            {title}
          </div>
        ) : null}

        <div className={styles.body}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}