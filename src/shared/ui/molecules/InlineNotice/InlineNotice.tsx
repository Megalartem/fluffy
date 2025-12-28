"use client";

import React from "react";
import clsx from "clsx";
import styles from "./InlineNotice.module.css";
import { Text, IconButton } from "@/shared/ui/atoms";
import { X } from "lucide-react";

export type InlineNoticeTone = "info" | "success" | "warning" | "error";

export function InlineNotice({
  tone = "info",
  title,
  children,
  icon,
  onClose,
  onClick,
  className,
}: {
  tone?: InlineNoticeTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={clsx(styles.root, styles[tone], className, onClick && styles.clickable)}
      role={tone === "error" ? "alert" : "status"}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {icon ? <div className={styles.icon}>{icon}</div> : null}

      <div className={styles.body}>
        {title ? (
          <Text variant="caption" className={styles.title}>
            {title}
          </Text>
        ) : null}
        {children ? (
          <Text variant="caption" className={styles.message}>
            {children}
          </Text>
        ) : null}
      </div>

      {onClose ? (
        <div className={styles.close}>
          <IconButton
            icon={X}
            aria-label="Закрыть уведомление"
            variant="ghost"
            size="s"
            onClick={onClose}
          />
        </div>
      ) : null}
    </div>
  );
}
