"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { IconName } from "lucide-react/dynamic";

import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";
import { ButtonBase } from "@/shared/ui/atoms";
import { FormFieldString } from "@/shared/ui/molecules/FormField/FormFieldString";

import styles from "./IconPickerSheet.module.css";

function getIconComponent(name: IconName) {
  // dynamic() returns a React component type
  return dynamic(dynamicIconImports[name], { ssr: false });
}

type Props = {
  open: boolean;
  title?: string;
  value: IconName;
  onClose: () => void;
  onChange: (next: IconName) => void;
};

export function IconPickerSheet({
  open,
  title = "Choose icon",
  value,
  onClose,
  onChange,
}: Props) {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const allNames = React.useMemo(() => Object.keys(dynamicIconImports) as IconName[], []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allNames.slice(0, 120); // ограничим первые N, чтобы не рендерить 1500+
    return allNames
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 240); // и при поиске тоже ограничим
  }, [allNames, query]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      height="full"
      title={<ModalHeader title={title} onClose={onClose} />}
      footer={
        <ButtonBase fullWidth onClick={onClose}>
          Done
        </ButtonBase>
      }
    >
      <div className={styles.body}>
        <div className={styles.search}>
          {/* можно заменить на ваш TextField, я использую готовый FormFieldString */}
          <FormFieldString<any>
            name={"__icon_search" as any}
            label="Search"
            placeholder="Type icon name..."
            value={query}
            onChange={(v: any) => setQuery(String(v ?? ""))}
          />
        </div>

        <div className={styles.grid} role="list">
          {filtered.map((name) => {
            const Icon = getIconComponent(name);
            const isSelected = name === value;

            return (
              <button
                key={name}
                type="button"
                className={styles.cell}
                data-selected={isSelected ? "true" : "false"}
                onClick={() => onChange(name)}
                aria-label={name}
                title={name}
              >
                <React.Suspense fallback={<span className={styles.fallback} />}>
                  <Icon className={styles.icon} />
                </React.Suspense>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}