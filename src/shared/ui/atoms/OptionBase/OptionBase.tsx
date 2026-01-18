"use client";

import React from "react";
import clsx from "clsx";
import styles from "./OptionBase.module.css";
import { Heading, Icon } from "@/shared/ui/atoms";
import { Check } from "lucide-react";

export type OptionState = "default" | "active" | "disabled";

export type OptionItem = {
  value: string;
  label: string;
  state?: OptionState;
  icon?: React.ReactNode;
};

export interface IOptionBase extends OptionItem {
  onSelect?: () => void;
}

export function OptionBase({
    state = "default",
    value,
    label,
    icon,
    onSelect,
}: IOptionBase) {

    return (
        <button
            value={value}
            disabled={state === "disabled"}
            className={clsx(
                styles.option, 
                state === "active" && styles.active,
                state === "disabled" && styles.disabled
            )}
            onClick={onSelect}
        >
            <div className={styles.optionBody}>
                {icon}
                <Heading as="h2" className={styles.title}>{label}</Heading>
            </div>
            <Icon
                icon={Check}
                variant={state === "active" ? "default" : "ghost"}
                className={styles.checkmark}
            />
        </button>
    )

}

