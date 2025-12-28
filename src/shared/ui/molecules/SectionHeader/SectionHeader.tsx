"use client";

import React from "react";
import clsx from "clsx";
import styles from "./SectionHeader.module.css";
import { Text, Heading } from "@/shared/ui/atoms";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.left}>
        <Heading
            variant="section"
            as="h3"
        >
            {title}
        </Heading>
        {subtitle ? (
          <Text variant="caption">
            {subtitle}
          </Text>
        ) : null}
      </div>

      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
