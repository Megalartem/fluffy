"use client";

import React from "react";

import { CategoryIcon } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader } from "@/shared/ui/molecules";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { IconName } from "lucide-react/dynamic";
import styles from "./CategoryChooseIconSheet.module.css";



interface CategoryChooseIconSheetProps {
    isOpen: boolean;
    iconKey: string | null;
    onSelectIcon: (iconKey: string) => void;
    onClose: () => void;
}

interface IOptionIcon {
    key: IconName;
    isSelected: boolean;
    onSelect: (name: IconName) => void;
}

function getIconComponent(name: IconName) {
  return dynamic(dynamicIconImports[name], { ssr: false });
}


function IconItem({
    key,
    isSelected,
    onSelect,
}: IOptionIcon) {
    return (
        <button
            className={styles.iconButton}
            data-selected={isSelected ? "true" : "false"}
            onClick={() => onSelect(key)}
            aria-label={`Select icon ${key}`}
        >
            <CategoryIcon
                icon={getIconComponent(key)}
                size={"m"}
                color={isSelected ? "primary" : "default"}
            /> 
        </button>
    );
}

export function CategoryChooseIconSheet({
    isOpen,
    iconKey,
    onSelectIcon,
    onClose,
}): CategoryChooseIconSheetProps {
    return (
        <BottomSheet
            open={isOpen}
            title={<ModalHeader
          title={"Choose Icon"}
          onClose={onClose}
        />}
            onClose={() => onClose()}
        >
            <div className={styles.iconGrid}>
                {Object.keys(dynamicIconImports).map((name) => (
                    <IconItem
                        key={name as IconName}
                        isSelected={name === iconKey}
                        onSelect={onSelectIcon}
                    />
                ))}
                </div>
            
        </BottomSheet>

    )
}