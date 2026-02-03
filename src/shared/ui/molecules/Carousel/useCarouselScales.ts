import { RefObject, useEffect, useState } from "react";
import { calcScaleByDistance, getAnchorX, getItemCenterX } from "./utils";

export type ScaleMode = "none" | "distance";

type UseCarouselScalesArgs = {
  itemsCount: number;
  scaleMode: ScaleMode;
  anchor: "start" | "center";
  minScale: number;
  maxScale: number;
  falloffPx: number;

  // Accept the real shape produced by useRef(null)
  wrapRef: RefObject<HTMLDivElement | null>;
  itemRefs: RefObject<(HTMLButtonElement | null)[]>;
};

export function useCarouselScales({
  itemsCount,
  scaleMode,
  anchor,
  minScale,
  maxScale,
  falloffPx,
  wrapRef,
  itemRefs,
}: UseCarouselScalesArgs) {
  const [scales, setScales] = useState<number[]>(() => Array(itemsCount).fill(1));

  // синхронизация длины scales при изменении itemsCount
  useEffect(() => {
    setScales(Array(itemsCount).fill(1));
  }, [itemsCount]);

  useEffect(() => {
    if (scaleMode === "none") {
      setScales(Array(itemsCount).fill(1));
      return;
    }

    const wrapEl = wrapRef.current;
    if (!wrapEl) return;

    const update = () => {
      const pr = wrapEl.getBoundingClientRect();
      const anchorX = getAnchorX(wrapEl, anchor, pr);

      const next = Array.from({ length: itemsCount }, (_, i) => {
        const btn = itemRefs.current[i];
        if (!btn) return 1;

        const r = btn.getBoundingClientRect();
        const centerX = getItemCenterX(wrapEl, pr, r);
        const dist = Math.abs(centerX - anchorX);

        return calcScaleByDistance({
          dist,
          minScale,
          maxScale,
          falloffPx,
        });
      });

      setScales(next);
    };

    update();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    wrapEl.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      wrapEl.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, [wrapRef, itemRefs, itemsCount, scaleMode, anchor, minScale, maxScale, falloffPx]);

  return scales;
}