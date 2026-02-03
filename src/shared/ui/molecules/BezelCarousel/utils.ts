export type VirtualEntry<T> = {
  item: T;
  realIndex: number;
  cycle: number;
};

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/**
 * Масштаб с easing:
 * curve < 1 => рост начинается раньше (с "середины")
 * curve > 1 => рост позже (ближе к безелю)
 */
export function calcScaleEased(params: {
  dist: number;
  minScale: number;
  maxScale: number;
  falloffPx: number;
  curve: number;
}) {
  const { dist, minScale, maxScale, falloffPx, curve } = params;

  const t = clamp(1 - dist / falloffPx, 0, 1);
  const e = Math.pow(t, curve);
  return minScale + (maxScale - minScale) * e;
}

export function buildVirtual<T>(items: T[], copies: number): VirtualEntry<T>[] {
  const out: VirtualEntry<T>[] = [];
  for (let c = 0; c < copies; c++) {
    for (let i = 0; i < items.length; i++) {
      out.push({ item: items[i], realIndex: i, cycle: c });
    }
  }
  return out;
}

/** Центр элемента в координатах scroll-контента rail */
export function getItemCenterX(params: {
  rail: HTMLDivElement;
  railRect: DOMRect;
  itemRect: DOMRect;
}) {
  const { rail, railRect, itemRect } = params;
  return rail.scrollLeft + (itemRect.left + itemRect.right) / 2 - railRect.left;
}

/** Центр bezеl в координатах scroll-контента rail */
export function getBezelAnchorX(params: {
  rail: HTMLDivElement;
  railRect: DOMRect;
  bezelRect: DOMRect;
}) {
  const { rail, railRect, bezelRect } = params;
  return rail.scrollLeft + (bezelRect.left + bezelRect.right) / 2 - railRect.left;
}