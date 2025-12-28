"use client";

import React from "react";
import clsx from "clsx";
import styles from "./NoticeStack.module.css";
import { InlineNotice } from "@/shared/ui/molecules/InlineNotice/InlineNotice";
import type { InlineNoticeTone } from "@/shared/ui/molecules/InlineNotice/InlineNotice";

export type NoticeItem = {
  id: string;
  tone?: InlineNoticeTone;
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
};

export function NoticeStack({
  items,
  maxVisible = 4,
  className,
}: {
  items: NoticeItem[];
  maxVisible?: number;
  className?: string;
}) {
  const visible = items.slice(0, maxVisible);

  if (visible.length === 0) return null;

  return (
    <div className={clsx(styles.root, className)} aria-label="Уведомления">
      {visible.map((n) => (
        <InlineNotice
          key={n.id}
          tone={n.tone ?? "info"}
          title={n.title}
          onClick={n.onClick}
          onClose={n.onClose}
        >
          {n.message}
        </InlineNotice>
      ))}
    </div>
  );
}