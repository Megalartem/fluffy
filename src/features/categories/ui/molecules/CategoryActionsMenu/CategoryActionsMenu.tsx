import React from "react";
import { Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/molecules";

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
    disabled,
}: CategoryActionsMenuProps) {
    const items: ActionMenuItem[] = [
        {
            id: "edit",
            label: "Edit",
            icon: Pencil,
            hidden: isArchived,
            onAction: onEdit,
        },
        {
            id: "archiveToggle",
            label: isArchived ? "Unarchive" : "Archive",
            icon: isArchived ? ArchiveRestore : Archive,
            onAction: onArchiveToggle.bind(null, !isArchived),
        },
        {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "danger",
            onAction: onDelete,
        },
    ];

    return (
        <ActionMenu
            ariaLabel="Category actions"
            items={items}
            disabled={disabled}
            onAction={() => {}}
        />
    );
}