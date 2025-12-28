"use client";

import React from "react";
import clsx from "clsx";
import styles from "./SortControl.module.css";
import { Icon } from "@/shared/ui/atoms";
import { ListRowBase } from "@/shared/ui/molecules";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortDirection = "asc" | "desc";
export type SortValue = {
  key: string | null;
  direction: SortDirection | null;
};

export type SortOption = {
  key: string;
  label: string;
};

export function SortControl({
  options,
  value,
  onChange,
  className,
}: {
  options: SortOption[];
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
}) {
  function handleClick(option: SortOption) {
    if (value.key !== option.key) {
      onChange({ key: option.key, direction: "desc" });
      return;
    }

    if (value.direction === "desc") {
      onChange({ key: option.key, direction: "asc" });
      return;
    }

    if (value.direction === "asc") {
      onChange({ key: null, direction: null });
      return;
    }

    onChange({ key: option.key, direction: "desc" });
  }

  return (
    <div className={clsx(styles.root, className)}>
      {options.map((option) => {
        const active = value.key === option.key;
        const direction = active ? value.direction : null;

        return (
          <ListRowBase
            key={option.key}
            tone={active ? "default" : "ghost"}
            onClick={() => handleClick(option)}
            title={option.label}
            trailing={
              direction === "desc" ? (
                <Icon icon={ArrowDown} size="s" />
              ) : direction === "asc" ? (
                <Icon icon={ArrowUp} size="s" />
              ) : null
            }
          />
        );
      })}
    </div>
  );
}