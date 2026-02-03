"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./BezelCarousel.module.css";
import { buildVirtual, VirtualEntry } from "./utils";
import { useInfiniteRail } from "./useInfiniteRail";
import { useDistanceScales } from "./useDistanceScales";
import { useBezelSelection } from "./useBezelSelection";

export type BezelCarouselProps<T> = {
  items: T[];
  getKey: (item: T) => string;

  /** UI */
  renderItem: (args: { item: T; index: number; scale: number; isSelected: boolean }) => React.ReactNode;
  renderBezel?: (args: { selectedItem?: T }) => React.ReactNode;
  renderOverlay?: (args: { selectedItem?: T }) => React.ReactNode;

  /** Selection (scroll-to-select) */
  selectedKey: string;
  onChangeSelected: (key: string, item: T) => void;

  /** Layout */
  itemHitPx?: number; // hit-area
  itemGapPx?: number; // должен совпадать с gap в css (дефолт 6)
  snap?: boolean;

  bezelSizePx?: number;
  bezelInsetPx?: number;

  /** Perspective */
  minScale?: number;
  maxScale?: number;
  falloffPx?: number;
  scaleCurve?: number; // <1 => увеличивается раньше (например 0.65)

  className?: string;
};

type BezelOverlayProps = {
  bezelRef: React.RefObject<HTMLDivElement | null>;
  isScrolling: boolean;
  insetPx: number;
  children: React.ReactNode;
};

const BezelOverlay = React.memo(function BezelOverlay({
  bezelRef,
  isScrolling,
  insetPx,
  children,
}: BezelOverlayProps) {
  return (
    <div
      ref={bezelRef}
      className={[styles.bezel, isScrolling ? styles.bezelScrolling : ""].join(" ")}
      style={{ left: insetPx }}
      aria-hidden
    >
      {children}
    </div>
  );
});

export function BezelCarousel<T>({
  items,
  getKey,
  renderItem,
  renderBezel,
  renderOverlay,
  selectedKey,
  onChangeSelected,

  itemHitPx = 44,
  itemGapPx = 6,
  snap = true,

  bezelSizePx = 56,
  bezelInsetPx = 0,

  minScale = 0.55,
  maxScale = 1,
  falloffPx = 420,
  scaleCurve = 0.65,

  className,
}: BezelCarouselProps<T>) {
  const railRef = useRef<HTMLDivElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const realCount = items.length;
  const COPIES = 3;

  const keys = useMemo(() => items.map(getKey), [items, getKey]);

  const selectedRealIndex = useMemo(() => {
    const idx = keys.indexOf(selectedKey);
    return idx >= 0 ? idx : 0;
  }, [keys, selectedKey]);

  const selectedItem = useMemo(
    () => (realCount > 0 ? items[selectedRealIndex] : undefined),
    [items, selectedRealIndex, realCount]
  );

  // Stable callback reference for onChangeSelected
  const handleChangeSelected = useCallback(
    (key: string, item: T) => {
      onChangeSelected(key, item);
    },
    [onChangeSelected]
  );

  const middleStart = realCount; // cycle=1
  const virtual: VirtualEntry<T>[] = useMemo(() => buildVirtual(items, COPIES), [items]);

  const [scales, setScales] = useState<number[]>(() => Array(virtual.length).fill(1));
  const [isScrolling, setIsScrolling] = useState(false);
  const [nearestVIdx, setNearestVIdx] = useState(() => middleStart + selectedRealIndex);

  const { maybeWrapScroll } = useInfiniteRail({
    railRef,
    itemRefs,
    middleStart,
    realCount,
    itemHitPx,
    itemGapPx,
  });

  const { findNearestVirtualIndex } = useBezelSelection<T>({
    railRef,
    itemRefs,
    virtual,
  });

  const { calcScales } = useDistanceScales<T>({
    railRef,
    itemRefs,
    virtual,
    minScale,
    maxScale,
    falloffPx,
    scaleCurve,
  });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || realCount === 0) return;

    requestAnimationFrame(() => {
      const targetVirtualIdx = middleStart + selectedRealIndex;
      setNearestVIdx(targetVirtualIdx);
      const node = itemRefs.current[targetVirtualIdx];
      if (!node) return;

      const railRect = rail.getBoundingClientRect();
      // Используем центр видимой области rail
      const anchorX = rail.scrollLeft + railRect.width / 2;

      const r = node.getBoundingClientRect();
      const centerX = rail.scrollLeft + (r.left + r.right) / 2 - railRect.left;

      rail.scrollLeft += centerX - anchorX;
    });
  }, [realCount, middleStart, selectedRealIndex]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || realCount === 0) return;

    let raf = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let lastKey = selectedKey;
    let ticking = false;

    const update = () => {
      ticking = false;
      maybeWrapScroll();

      const newScales = calcScales();
      setScales((prev) => {
        if (prev.length !== newScales.length) return newScales;
        const hasChanges = newScales.some((s, i) => Math.abs(s - prev[i]) > 0.001);
        return hasChanges ? newScales : prev;
      });

      const nearestVIdx = findNearestVirtualIndex();
      setNearestVIdx(nearestVIdx);
      const realIdx = virtual[nearestVIdx]?.realIndex ?? 0;
      const nextKey = keys[realIdx];

      if (nextKey && nextKey !== lastKey) {
        lastKey = nextKey;
        handleChangeSelected(nextKey, items[realIdx]);
      }
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsScrolling(false), 120);

      maybeWrapScroll();
      requestUpdate();
    };

    update();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", requestUpdate);
      if (scrollTimer) clearTimeout(scrollTimer);
      cancelAnimationFrame(raf);
    };
  }, [
    realCount,
    selectedKey,
    maybeWrapScroll,
    calcScales,
    findNearestVirtualIndex,
    keys,
    virtual,
    handleChangeSelected,
    items,
  ]);

  const rootStyle = useMemo(
    () =>
      ({
        ["--bezel-size"]: `${bezelSizePx}px`,
        ["--bezel-inset"]: `${bezelInsetPx}px`,
        ["--hit"]: `${itemHitPx}px`,
        ["--gap"]: `${itemGapPx}px`,
      }) as React.CSSProperties,
    [bezelSizePx, bezelInsetPx, itemHitPx, itemGapPx]
  );

  return (
    <div
      className={[styles.root, className ?? ""].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      <BezelOverlay
        bezelRef={bezelRef}
        isScrolling={isScrolling}
        insetPx={bezelInsetPx}
      >
        {renderBezel && renderBezel({ selectedItem })}
      </BezelOverlay>

      {renderOverlay && (
        <div className={styles.overlay}>
          {renderOverlay({ selectedItem })}
        </div>
      )}

      <div
        ref={railRef}
        className={[
          styles.rail,
          snap ? styles.snap : "",
          isScrolling ? styles.railScrolling : "",
        ].join(" ")}
        aria-label="Bezel Carousel"
        role="listbox"
      >
        {virtual.map((entry, vIdx) => {
          const baseKey = keys[entry.realIndex] ?? `${entry.realIndex}`;
          const key = `${entry.cycle}-${baseKey}-${vIdx}`;
          const isSelected = vIdx === nearestVIdx;

          return (
            <div
              key={key}
              ref={(n) => {
                itemRefs.current[vIdx] = n;
              }}
              className={[styles.item, snap ? styles.snapItem : ""].join(" ")}
            >
              {renderItem({
                item: entry.item,
                index: entry.realIndex,
                scale: scales[vIdx] ?? 1,
                isSelected,
              })}
            </div>
          );
        })}
      </div>

      <div
        className={[styles.vignette, isScrolling ? styles.vignetteScrolling : ""].join(" ")}
        aria-hidden
      />
    </div>
  );
}