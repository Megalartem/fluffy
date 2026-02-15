"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { BezelCarousel } from "@/shared/ui/molecules";
import { FormFieldBase } from "@/shared/ui/molecules/FormField/FormFieldBase";
import styles from "./GoalColorField.module.css";
import { GOAL_COLORS, GOAL_COLOR_LABELS, type GoalColor } from "../../../model/types";

type ColorItem = { id: GoalColor; name: string };

// Static color items - no need to recalculate on each render
const COLOR_ITEMS: ColorItem[] = GOAL_COLORS.map((id) => ({ 
  id, 
  name: GOAL_COLOR_LABELS[id] ?? id 
}));

interface GoalColorFieldProps {
  name: string;
  label?: string;
}

export function GoalColorField({ name, label = "Color" }: GoalColorFieldProps) {
  const { watch, setValue } = useFormContext();
  const selectedColor = watch(name) as GoalColor | null;

  const selected = useMemo(() => {
    if (!selectedColor) return COLOR_ITEMS[0];
    return COLOR_ITEMS.find((c) => c.id === selectedColor) ?? COLOR_ITEMS[0];
  }, [selectedColor]);

  const handleColorChange = (key: string) => {
    setValue(name, key as GoalColor, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <FormFieldBase label={label}>
      <div className={styles.container}>
        <BezelCarousel<ColorItem>
          items={COLOR_ITEMS}
          getKey={(c) => c.id}
          selectedKey={selected.id}
          onChangeSelected={handleColorChange}
          snap
          minScale={0.5}
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
        />
      </div>
    </FormFieldBase>
  );
}