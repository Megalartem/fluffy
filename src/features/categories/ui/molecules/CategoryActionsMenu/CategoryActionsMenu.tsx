"use client";

import React from "react";
import { MenuTrigger, Popover, Menu, MenuItem, Button } from "react-aria-components";
import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";

import { Icon } from "@/shared/ui/atoms";
import styles from "./CategoryActionsMenu.module.css";
import clsx from "clsx";

type ActionKey = "edit" | "archiveToggle" | "delete";

export type CategoryActionsMenuProps = {
    isArchived?: boolean;

    onEdit: () => void;
    onArchiveToggle: (next: boolean) => void;
    onDelete: () => void;

    disabled?: boolean;
};

export function CategoryActionsMenu({
    isArchived = false,
    onEdit,
    onArchiveToggle,
    onDelete,
}: CategoryActionsMenuProps) {
    const handleAction = React.useCallback(
        (key: React.Key) => {
            const k = String(key) as ActionKey;

            if (k === "edit") onEdit();
            if (k === "archiveToggle") onArchiveToggle(!isArchived);
            if (k === "delete") onDelete();
        },
        [onEdit, onArchiveToggle, onDelete, isArchived]
    );

    return (
        <MenuTrigger>
            <Button
                aria-label="Category actions"
                className={styles.trigger}>
                <Icon icon={MoreVertical} size="m" />
            </Button>

            <Popover className={styles.popover} placement="bottom end" offset={8}>
                <Menu className={styles.menu} onAction={handleAction}>
                    <MenuItem id="edit" className={styles.item}>
                        <Pencil className={styles.itemIcon} />
                        <span>Edit</span>
                    </MenuItem>

                    <MenuItem id="archiveToggle" className={styles.item}>
                        {isArchived ? (
                            <>
                                <ArchiveRestore className={styles.itemIcon} />
                                <span>Unarchive</span>
                            </>
                        ) : (
                            <>
                                <Archive className={styles.itemIcon} />
                                <span>Archive</span>
                            </>
                        )}
                    </MenuItem>

                    <MenuItem id="delete" className={clsx(styles.item, styles.deleteItem)}>
                        <Trash2 className={styles.itemIcon} />
                        <span>Delete</span>
                    </MenuItem>
                </Menu>
            </Popover>
        </MenuTrigger>
    );
}

CategoryActionsMenu.displayName = "CategoryActionsMenu";