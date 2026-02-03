"use client";

import React, { useMemo, useRef } from "react";
import styles from "./Carousel.module.css";
import { useCarouselScales, ScaleMode } from "./useCarouselScales";

export type CarouselProps<T> = {
  items: T[];
  getKey: (item: T) => string;

  renderItem: (args: {
    item: T;
    index: number;
    selected: boolean;
    scale: number;
  }) => React.ReactNode;

  selectedKey?: string;
  onSelect?: (key: string, item: T) => void;

  snap?: boolean;
  anchor?: "start" | "center";
  scaleMode?: ScaleMode;

  minScale?: number;
  maxScale?: number;
  falloffPx?: number;

  hitSizePx?: number;
  className?: string;

  trailing?: React.ReactNode;
};

export function Carousel<T>({
  items,
  getKey,
  renderItem,
  selectedKey,
  onSelect,

  snap = true,
  anchor = "start",
  scaleMode = "none",

  minScale = 0.55,
  maxScale = 1,
  falloffPx = 420,

  hitSizePx = 44,
  className,
  trailing,
}: CarouselProps<T>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const keys = useMemo(() => items.map(getKey), [items, getKey]);

  const scales = useCarouselScales({
    itemsCount: items.length,
    scaleMode,
    anchor,
    minScale,
    maxScale,
    falloffPx,
    wrapRef,
    itemRefs,
  });

  const rootClassName = [
    styles.root,
    snap ? styles.snap : "",
    anchor === "center" ? styles.anchorCenter : styles.anchorStart,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wrapRef} className={rootClassName}>
      {items.map((item, i) => {
        const key = keys[i];
        const selected = key === selectedKey;
        const scale = scales[i] ?? 1;

        const itemClassName = [
          styles.item,
          snap ? (anchor === "center" ? styles.snapCenter : styles.snapStart) : "",
          selected ? styles.itemSelected : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={key}
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            type="button"
            onClick={() => onSelect?.(key, item)}
            className={itemClassName}
            style={{ width: hitSizePx, height: hitSizePx }}
            aria-pressed={selected}
          >
            {renderItem({ item, index: i, selected, scale })}
          </button>
        );
      })}

      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}