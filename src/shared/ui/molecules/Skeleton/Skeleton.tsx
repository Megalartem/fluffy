"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Skeleton.module.css";

export type SkeletonVariant = "line" | "block" | "circle";

export function Skeleton({
  variant = "line",
  width,
  height,
  radius,
  className,
  style,
}: {
  variant?: SkeletonVariant;
  /** Any CSS size value: 120, "120px", "60%", "12rem" */
  width?: number | string;
  /** Any CSS size value: 16, "16px", "2.5rem" */
  height?: number | string;
  /** Border radius override: 12, "12px" */
  radius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;
  const r = typeof radius === "number" ? `${radius}px` : radius;

  return (
    <div
      aria-hidden="true"
      className={clsx(styles.root, styles[variant], className)}
      style={{
        ...(w ? ({ ["--sk-w"]: w } as React.CSSProperties) : null),
        ...(h ? ({ ["--sk-h"]: h } as React.CSSProperties) : null),
        ...(r ? ({ ["--sk-r"]: r } as React.CSSProperties) : null),
        ...style,
      }}
    />
  );
}

export function SkeletonText({
  lines = 2,
  lastLineWidth = "70%",
  className,
}: {
  lines?: number;
  lastLineWidth?: number | string;
  className?: string;
}) {
  const w = typeof lastLineWidth === "number" ? `${lastLineWidth}px` : lastLineWidth;

  return (
    <div className={clsx(styles.text, className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="line"
          width={i === lines - 1 ? w : "100%"}
          height={12}
        />
      ))}
    </div>
  );
}
