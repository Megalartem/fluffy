import React from "react";
import clsx from "clsx";
import styles from "./ListRowBase.module.css";
import useLongPress from "@/shared/hooks/useLongPress";

export type ListRowBaseTone = "default" | "muted" | "ghost";
export type ListRowBaseSize = "m" | "l";

export function ListRowBase({
    leading,
    title,
    subtitle,
    trailing,
    onClick,
    onLongPress,
    tone = "default",
    size = "m",
    className,
    role,
    ariaLabel,
    ariaSelected,
    disabled = false,
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
    ariaSelected?: boolean;
    disabled?: boolean;
    onLongPress?: () => void;
}) {
    const isInteractive = Boolean(onClick || onLongPress);
    const longPressHandlers = useLongPress(
        onLongPress || (() => {}),
        onClick || (() => {})
    );

    return (
        <div
            className={clsx(
                styles.root,
                tone === "muted" && styles.muted,
                tone === "ghost" && styles.ghost,
                size === "l" ? styles.l : styles.m,
                isInteractive && styles.interactive,
                className
            )}
            {...longPressHandlers}
            role={role}
            aria-label={ariaLabel}
            aria-selected={ariaSelected}
            aria-disabled={disabled}
        >
            {leading ? <div className={styles.leading}>{leading}</div> : null}

            <div className={styles.center}>
                <div className={styles.title}>{title}</div>
                {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
            </div>

            {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
        </div>
    );
}