import React from "react";
import clsx from "clsx";
import styles from "./EmptyState.module.css";
import { ButtonBase, Text, Heading } from "@/shared/ui/atoms";

export type EmptyStateTone = "default" | "muted";
export type EmptyStateSize = "m" | "l";

export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  tone = "default",
  size = "m",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  tone?: EmptyStateTone;
  size?: EmptyStateSize;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        styles.root,
        tone === "muted" && styles.muted,
        size === "l" ? styles.l : styles.m,
        className
      )}
    >
      {icon ? <div className={styles.icon}>{icon}</div> : null}

      <div className={styles.content}>
        <Heading as="h2">
          {title}
        </Heading>

        {description ? (
          <Text variant="body" className={styles.description}>
            {description}
          </Text>
        ) : null}

        {primaryAction || secondaryAction ? (
          <div className={styles.actions}>
            {primaryAction ? (
              <ButtonBase size="m" variant="default" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </ButtonBase>
            ) : null}

            {secondaryAction ? (
              <ButtonBase size="m" variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </ButtonBase>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
