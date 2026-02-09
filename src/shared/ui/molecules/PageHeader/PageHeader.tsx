import React from "react";
import clsx from "clsx";

import styles from "./PageHeader.module.css";
import { Heading } from "@/shared/ui/atoms";

export type PageHeaderProps = {
    /** Left slot (e.g. Back button) */
    left?: React.ReactNode;
    /** Right slot (e.g. menu button) */
    right?: React.ReactNode;
    title: string
    className?: string;
};

export function PageHeader({
    left,
    right,
    title,
    className,
}: PageHeaderProps) {
    return (
        <header className={clsx(styles.root, className)}>
            <div className={styles.side} data-slot="left">
                <div className={styles.sideInner}>{left ?? null}</div>
            </div>

            <div className={styles.center}>
                <Heading as={"h1"} variant={"page"}>
                    {title}
                </Heading>
            </div>

            <div className={styles.side} data-slot="right">
                <div className={styles.sideInner}>{right ?? null}</div>
            </div>
        </header>
    );
}

PageHeader.displayName = "PageHeader";