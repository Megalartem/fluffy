"use client";

import React from "react";
import clsx from "clsx";
import styles from "./SearchBar.module.css";
import { Dot, SearchInput } from "@/shared/ui/atoms";
import { IconButton } from "@/shared/ui/atoms";
import { SlidersHorizontal } from "lucide-react";

export function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    onOpenFilters,
    filtersActive = false,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onOpenFilters?: () => void;
    filtersActive?: boolean;
    className?: string;
}) {
    return (
        <div className={clsx(styles.root, className)}>
            <SearchInput
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClear={() => onChange('')}
                placeholder={placeholder}
                className={styles.input}
            />
            {onOpenFilters ? (
                <div className={styles.filtersWrap}>
                    <IconButton
                        type="button"
                        variant="muted"
                        iconSize="l"
                        icon={SlidersHorizontal}
                        onClick={onOpenFilters}
                        aria-label="Open filters"
                    />
                    {filtersActive ? 
                    <Dot 
                        size="l"
                        colorKey="muted" 
                        className={styles.dot}
                    /> : null}
                </div>
            ) : null}
        </div>
    );
}