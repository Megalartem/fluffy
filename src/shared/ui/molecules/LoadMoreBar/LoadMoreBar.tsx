"use client";

import React from "react";
import clsx from "clsx";
import styles from "./LoadMoreBar.module.css";
import { ButtonBase, Text } from "@/shared/ui/atoms";

export type LoadMoreBarState = "idle" | "loading" | "disabled";

export function LoadMoreBar({
  state = "idle",
  onLoadMore,
  label = "Показать ещё",
  loadingLabel = "Загружаю…",
  disabledLabel,
  hint,
  className,
}: {
  state?: LoadMoreBarState;
  onLoadMore?: () => void;
  label?: string;
  loadingLabel?: string;
  disabledLabel?: string;
  /** Optional helper text below the button */
  hint?: React.ReactNode;
  className?: string;
}) {
  const isLoading = state === "loading";
  const isDisabled = state === "disabled" || isLoading;

  const buttonText = isLoading ? loadingLabel : state === "disabled" ? (disabledLabel ?? label) : label;

  return (
    <div className={clsx(styles.root, className)}>
      <ButtonBase
        variant="muted"
        className={styles.button}
        onClick={isDisabled ? undefined : onLoadMore}
        aria-disabled={isDisabled}
        disabled={isDisabled}
      >
        <span className={styles.content}>
          {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          <span>{buttonText}</span>
        </span>
      </ButtonBase>

      {hint ? (
        <Text variant="caption" className={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
