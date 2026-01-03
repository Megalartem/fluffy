import React from "react";
import clsx from "clsx";
import styles from "./ModalActions.module.css";
import { ButtonBase } from "@/shared/ui/atoms";

export type ModalActionsLayout = "row" | "column";

export type ModalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export interface ModalActionsProps {
  primary?: ModalAction;
  secondary?: ModalAction;
  layout?: ModalActionsLayout; // default: column (mobile-friendly)
  className?: string;
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  primary,
  secondary,
  layout = "column",
  className,
}) => {
  return (
    <div
      className={clsx(
        styles.root,
        layout === "row" ? styles.row : styles.column,
        className
      )}
    >
      {secondary ? (
        <ButtonBase
          variant="ghost"
          size="m"
          onClick={secondary.onClick}
          disabled={secondary.disabled}
        >
          {secondary.label}
        </ButtonBase>
      ) : null}

      {primary ? (
        <ButtonBase
          variant="default"
          size="m"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label}
        </ButtonBase>
      ) : null}
    </div>
  );
};

ModalActions.displayName = "ModalActions";