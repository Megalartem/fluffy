"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";

import { CategoryIcon, ButtonBase } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader, Skeleton, SearchBar } from "@/shared/ui/molecules";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { IconName } from "lucide-react/dynamic";
import styles from "./CategoryChooseIconSheet.module.css";
import { getLazyLucideIcon } from "@/shared/lib/renderCategoryIcon";

const ICONS_PER_BATCH = 50;
const ALL_ICONS = Object.keys(dynamicIconImports) as IconName[];

interface CategoryChooseIconSheetProps {
    isOpen: boolean;
    iconKey: IconName | null;
    onSubmit: (iconKey: IconName | null) => void;
    onClose: () => void;
}

interface IOptionIcon {
    iconName: IconName;
    isSelected: boolean;
    onSelect: (name: IconName) => void;
}

function IconItem({
    iconName,
    isSelected,
    onSelect,
}: IOptionIcon) {
    return (
        <button
            className={styles.iconButton}
            data-selected={isSelected ? "true" : "false"}
            onClick={() => onSelect(iconName)}
            aria-label={`Select icon ${iconName}`}
        >
            <React.Suspense fallback={<div style={{ width: 24, height: 24 }} />}>
                <CategoryIcon
                    icon={getLazyLucideIcon(iconName)}
                    size={"l"}
                />
            </React.Suspense>
        </button>
    );
}

function CategoryChooseIconSheetContent({
    onSelectIcon,
    selectedIcon,
    filteredIcons,
}: {
    onSelectIcon: (name: IconName) => void;
    selectedIcon: IconName | null;
    filteredIcons: IconName[];
}) {
    const [visibleCount, setVisibleCount] = useState(ICONS_PER_BATCH);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for loading the next batch
    useEffect(() => {
        const trigger = loadMoreTriggerRef.current;
        if (!trigger) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredIcons.length) {
                    setVisibleCount((prev) => Math.min(prev + ICONS_PER_BATCH, filteredIcons.length));
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(trigger);
        return () => observer.disconnect();
    }, [visibleCount, filteredIcons.length]);

    const visibleIcons = filteredIcons.slice(0, visibleCount);
    const hasMore = visibleCount < filteredIcons.length;

    return (
        <div 
            ref={scrollContainerRef}
            className={styles.iconGrid}
        >
            {visibleIcons.map((name) => (
                <IconItem
                    key={name}
                    iconName={name}
                    isSelected={selectedIcon === name}
                    onSelect={onSelectIcon}
                />
            ))}
            {hasMore && (
                <div 
                    ref={loadMoreTriggerRef}
                    className={styles.loadMoreTrigger}
                >
                    <Skeleton width={"100%"} height={32} />
                    <Skeleton width={"100%"} height={32} />
                </div>
            )}
        </div>
    );
}

export function CategoryChooseIconSheet({
    isOpen,
    iconKey,
    onSubmit,
    onClose,
}: CategoryChooseIconSheetProps) {
    const [selectedIcon, setSelectedIcon] = useState<IconName | null>(iconKey);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setSelectedIcon(iconKey);
    }, [iconKey]);

    // Reset search query when sheet is closed
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    // Filter icons by search query
    const filteredIcons = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return query
            ? ALL_ICONS.filter((name) => name.toLowerCase().includes(query))
            : ALL_ICONS;
    }, [searchQuery]);

    const submitIconHandle = React.useCallback(() => {
        onSubmit(selectedIcon);
        onClose();
    }, [selectedIcon, onSubmit, onClose]);
    return (
        <BottomSheet
            open={isOpen}
            title={
                <div className={styles.header}>
                <ModalHeader
                    title={"Choose Icon"}
                    onClose={onClose}
                />
                <SearchBar
                    value={searchQuery}
                    onChange={React.useCallback((value: string) => setSearchQuery(value), [])}
                    placeholder="Search icons..."
                />
                </div>
            }
            onClose={() => onClose()}
                    footer={
          <ButtonBase
            fullWidth
            onClick={submitIconHandle}
          >
            {"Save"}
          </ButtonBase>
        }
        >
                <CategoryChooseIconSheetContent
                    key={searchQuery.toLowerCase().trim()}
                    selectedIcon={selectedIcon}
                    onSelectIcon={setSelectedIcon}
                    filteredIcons={filteredIcons}
                />
        </BottomSheet>
    );
}