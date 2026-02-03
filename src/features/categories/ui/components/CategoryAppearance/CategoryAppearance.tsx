"use client";

import React, { useMemo } from "react";
import { BezelCarousel } from "@/shared/ui/molecules/BezelCarousel/BezelCarousel";
import styles from "./CategoryAppearance.module.css";
import { CATEGORY_COLOR_KEYS, COLOR_LABELS, type CategoryColor } from "../../../model/types";

type ColorItem = { id: CategoryColor; name: string };

const EXCLUDE_FROM_CAROUSEL: CategoryColor[] = ["tx-type"];

export function CategoryAppearance({
  icon,
  colorId,
  onChangeColor,
}: {
  icon: React.ReactNode;
  colorId: CategoryColor;
  onChangeColor: (id: CategoryColor) => void;
}) {
  const items: ColorItem[] = useMemo(() => {
    return CATEGORY_COLOR_KEYS
      .filter((k) => !EXCLUDE_FROM_CAROUSEL.includes(k))
      .map((id) => ({ id, name: COLOR_LABELS[id] ?? id }));
  }, []);

  const selected = useMemo(() => {
    return items.find((c) => c.id === colorId) ?? items[0];
  }, [items, colorId]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>Внешний вид</div>

      <BezelCarousel<ColorItem>
        items={items}
        getKey={(c) => c.id}
        selectedKey={selected.id}
        onChangeSelected={(key) => onChangeColor(key as CategoryColor)}
        snap
        minScale={0.4}
        maxScale={1}
        falloffPx={320}
        scaleCurve={0.7}
        itemHitPx={44}
        itemGapPx={6}
        renderItem={({ item, scale }) => (
          <span
            className={styles.swatch}
            data-color={item.id}
            style={{ transform: `scale(${scale})` }}
            aria-label={`color: ${item.name}`}
          />
        )}
        renderOverlay={() => (
          <button
            className={styles.preview}
            onClick={() => console.log("Icon picker clicked")}
            aria-label="Change icon"
          >
            <span className={styles.icon}>{icon}</span>
          </button>
        )}
      />

      <div className={styles.caption}>
        Цвет: <span className={styles.captionStrong}>{selected.name}</span>
      </div>
    </div>
  );
}