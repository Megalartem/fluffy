"use client";

import React from "react";
import clsx from "clsx";
import styles from "./OptionBase.module.css";
import { Heading, Icon } from "@/shared/ui/atoms";
import { Check } from "lucide-react";


export interface OptionBaseProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    isChecked?: boolean;
    onClick?: () => void;
}

export function OptionBase({
    value,
    label,
    icon,
    disabled,
    isChecked,
    onClick,
}: OptionBaseProps) {

    return (
        <button
            value={value}
            disabled={disabled}
            className={clsx(
                styles.option, 
                disabled && styles.disabled, 
                isChecked && styles.active)}
            onClick={onClick}
        >
            <div className={styles.optionBody}>
                {icon}
                <Heading 
                    as="h2"
                    className={styles.title}
                    >{label}</Heading>
            </div>
            <Icon
                icon={Check}
                variant={isChecked ? "default" : "ghost"}
                className={styles.checkmark}
            />
        </button>
    )

}

