import { useCallback } from "react";
import { VirtualEntry, clamp, getItemCenterX } from "./utils";



export function useBezelSelection<T>(params: {
  railRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<(HTMLDivElement | null)[]>;
  virtual: VirtualEntry<T>[];
}) {
  const { railRef, itemRefs, virtual } = params;

  const getAnchorX = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 0;

    const railRect = rail.getBoundingClientRect();
    return rail.scrollLeft + railRect.width / 2;
  }, [railRef]);

  const findNearestVirtualIndex = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 0;

    const railRect = rail.getBoundingClientRect();
    // Используем центр видимой области rail как anchor
    const anchorX = rail.scrollLeft + railRect.width / 2;

    let nearestIdx = 0;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < virtual.length; i++) {
      const node = itemRefs.current[i];
      if (!node) continue;

      const itemRect = node.getBoundingClientRect();
      const centerX = getItemCenterX({ rail, railRect, itemRect });
      const dist = Math.abs(centerX - anchorX);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    return clamp(nearestIdx, 0, Math.max(0, virtual.length - 1));
  }, [railRef, itemRefs, virtual]);

  return { getAnchorX, findNearestVirtualIndex };
}