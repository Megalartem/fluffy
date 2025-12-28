"use client";

import React, { useEffect, useId } from "react";
import clsx from "clsx";
import styles from "./Modal.module.css";
import { Overlay } from "@/shared/ui/atoms";

export type ModalSize = "s" | "m" | "l";

export function Modal({
    open,
    title,
    children,
    onClose,
    dismissible = true,
    size = "m",
    className,
    ariaLabel,
}: {
    open: boolean;
    title?: React.ReactNode;
    children: React.ReactNode;
    onClose: () => void;
    dismissible?: boolean;
    size?: ModalSize;
    className?: string;
    ariaLabel?: string;
}) {
    const titleId = useId();


    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && dismissible) onClose();
        };

        window.addEventListener("keydown", onKeyDown);

        // блокируем скролл под модалкой
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.documentElement.style.overflow = prevOverflow;
        };
    }, [open, onClose, dismissible]);

    if (!open) return null;

    return (
        <div className={styles.root} aria-hidden={!open}>
            <Overlay
                visible={open}
                onClick={dismissible ? onClose : undefined}
            />

            <div className={styles.center}>
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    aria-labelledby={title ? titleId : undefined}
                    className={clsx(
                        styles.dialog,
                        size === "s" && styles.s,
                        size === "m" && styles.m,
                        size === "l" && styles.l,
                        className
                    )}
                >
                    {title ? (
                        <div id={titleId} className={styles.title}>
                            {title}
                        </div>
                    ) : null}

                    <div className={styles.body}>{children}</div>
                </div>
            </div>
        </div>
    );
}