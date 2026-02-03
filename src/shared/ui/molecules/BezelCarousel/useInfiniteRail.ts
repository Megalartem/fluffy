import { useCallback } from "react";

export function useInfiniteRail(params: {
  railRef: React.RefObject<HTMLDivElement | null >;
  itemRefs: React.RefObject<(HTMLDivElement | null)[]>;
  middleStart: number;
  realCount: number;
  itemHitPx: number;
  itemGapPx: number;
}) {
  const { railRef, itemRefs, middleStart, realCount, itemHitPx, itemGapPx } = params;

  const getCycleWidth = useCallback(() => {
    const a = itemRefs.current[middleStart];
    const b = itemRefs.current[middleStart + realCount];

    // Лучше offsetLeft (не зависит от viewport), чем getBoundingClientRect
    if (!a || !b) return realCount * (itemHitPx + itemGapPx);
    return b.offsetLeft - a.offsetLeft;
  }, [itemRefs, middleStart, realCount, itemHitPx, itemGapPx]);

  const maybeWrapScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const cycleW = getCycleWidth();
    if (!cycleW) return;

    // Держим вокруг средней копии (в обе стороны "бесконечно")
    const leftBound = cycleW * 0.5;
    const rightBound = cycleW * 1.5;

    if (rail.scrollLeft < leftBound) rail.scrollLeft += cycleW;
    else if (rail.scrollLeft > rightBound) rail.scrollLeft -= cycleW;
  }, [railRef, getCycleWidth]);

  return { getCycleWidth, maybeWrapScroll };
}