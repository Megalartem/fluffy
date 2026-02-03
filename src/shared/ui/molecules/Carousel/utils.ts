export type AnchorMode = "start" | "center";

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function getAnchorX(
  el: HTMLDivElement,
  anchor: AnchorMode,
  containerRect: DOMRect
) {
  return anchor === "start"
    ? el.scrollLeft
    : el.scrollLeft + containerRect.width / 2;
}

export function getItemCenterX(
  el: HTMLDivElement,
  containerRect: DOMRect,
  itemRect: DOMRect
) {
  // центр item'а в координатах scroll-контента контейнера
  return el.scrollLeft + (itemRect.left + itemRect.right) / 2 - containerRect.left;
}

export function calcScaleByDistance(params: {
  dist: number;
  minScale: number;
  maxScale: number;
  falloffPx: number;
}) {
  const { dist, minScale, maxScale, falloffPx } = params;
  const s = maxScale - dist / falloffPx;
  return clamp(s, minScale, maxScale);
}