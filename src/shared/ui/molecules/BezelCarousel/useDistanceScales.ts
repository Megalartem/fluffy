import { useCallback } from "react";
import { VirtualEntry, calcScaleEased, getItemCenterX } from "./utils";


export function useDistanceScales<T>(params: {
  railRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<(HTMLDivElement | null)[]>;
  virtual: VirtualEntry<T>[];

  minScale: number;
  maxScale: number;
  falloffPx: number;
  scaleCurve: number;
}) {
  const {
    railRef,
    itemRefs,
    virtual,
    minScale,
    maxScale,
    falloffPx,
    scaleCurve,
  } = params;

  const calcScales = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return Array(virtual.length).fill(1);

    const railRect = rail.getBoundingClientRect();
    // Используем центр видимой области rail как anchor
    const anchorX = rail.scrollLeft + railRect.width / 2;

    const scales = virtual.map((_, i) => {
      const node = itemRefs.current[i];
      if (!node) return 1;

      const itemRect = node.getBoundingClientRect();
      const centerX = getItemCenterX({ rail, railRect, itemRect });
      const dist = Math.abs(centerX - anchorX);

      const scale = calcScaleEased({
        dist,
        minScale,
        maxScale,
        falloffPx,
        curve: scaleCurve,
      });
    

      return scale;
    });
    
    return scales;
  }, [railRef, itemRefs, virtual, minScale, maxScale, falloffPx, scaleCurve]);

  return { calcScales };
}