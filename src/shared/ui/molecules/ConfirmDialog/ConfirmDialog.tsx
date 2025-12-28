"use client";

import React from "react";
import clsx from "clsx";
import styles from "./ConfirmDialog.module.css";
import { Modal } from "../Modal/Modal";
import { Text, Heading } from "@/shared/ui/atoms";
import { ModalActions } from "../ModalActions/ModalActions";

export type ConfirmTone = "default" | "danger";

export function ConfirmDialog({
    open,
    title = "Confirm action",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmDisabled,
    closeOnOverlay = true,
    onConfirm,
    onCancel,
    className,
}: {
    open: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    confirmDisabled?: boolean;
    loading?: boolean;
    /** Whether clicking on overlay closes dialog */
    closeOnOverlay?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    className?: string;
}) {
    return (
        <Modal open={open} title={undefined} onClose={closeOnOverlay ? onCancel : () => { }}>
            <div className={clsx(styles.root, className)}>
                <div className={styles.header}>
                    <Heading as="h2" className={styles.title}>
                        {title}
                    </Heading>
                    {description ? (
                        <Text variant="body" className={styles.description}>
                            {description}
                        </Text>
                    ) : null}
                </div>
                <ModalActions
                    layout="row"
                    primary={{
                        label: confirmLabel,
                        onClick: onConfirm,
                        disabled: confirmDisabled,
                    }}
                    secondary={{
                        label: cancelLabel,
                        onClick: onCancel,
                    }}
                />

            </div>
        </Modal>
    );
}

ConfirmDialog.displayName = "ConfirmDialog";