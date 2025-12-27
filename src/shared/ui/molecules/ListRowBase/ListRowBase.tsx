import React from "react";
import clsx from "clsx";
import styles from "./ListRowBase.module.css";

export type ListRowBaseTone = "default" | "muted" | "ghost";
export type ListRowBaseSize = "m" | "l";

export function ListRowBase({
    leading,
    title,
    subtitle,
    trailing,
    onClick,
    tone = "default",
    size = "m",
    className,
    role,
    ariaLabel,
}: {
    leading?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    trailing?: React.ReactNode;
    onClick?: () => void;
    tone?: ListRowBaseTone;
    size?: ListRowBaseSize;
    className?: string;
    role?: React.AriaRole;
    ariaLabel?: string;
}) {
    const isInteractive = Boolean(onClick);

    const Comp: React.ElementType = isInteractive ? "button" : "div";

    return (
        <Comp
            type={isInteractive ? "button" : undefined}
            className={clsx(
                styles.root,
                tone === "muted" && styles.muted,
                tone === "ghost" && styles.ghost,
                size === "l" ? styles.l : styles.m,
                isInteractive && styles.interactive,
                className
            )}
            onClick={onClick}
            role={role}
            aria-label={ariaLabel}
        >
            {leading ? <div className={styles.leading}>{leading}</div> : null}

            <div className={styles.center}>
                <div className={styles.title}>{title}</div>
                {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
            </div>

            {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
        </Comp>
    );
}