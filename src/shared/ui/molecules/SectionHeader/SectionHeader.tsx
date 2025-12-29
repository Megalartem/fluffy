"use client";

import React from "react";
import clsx from "clsx";
import styles from "./SectionHeader.module.css";
import { Text, Heading } from "@/shared/ui/atoms";

type HeaderText = "primary" | "secondary"

export function SectionHeader({
  title,
  subtitle,
  className,
  rightSec,
  headerText = "secondary"
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSec?: React.ReactNode;
  headerText?: HeaderText;
  className?: string;
}) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.left}>
        <Heading
          variant={headerText === "primary" ? "amount" : "section"}
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
      {rightSec ? <div className={styles.rightSec}>{rightSec}</div> : null}
    </div>
  );
}
