import React from "react";
import { Surface } from "@/shared/ui/atoms";
import styles from "./Card.module.css";
import clsx from "clsx";

export type CardVariant = "default" | "ghost";
export type CardPadding = "md" | "lg";

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  className,
  children,
}) => {
  return (
    <Surface
      variant={variant}
      data-padding={padding}
      className={clsx(styles.card, className)}
    >
      {children}
    </Surface>
  );
};

Card.displayName = "Card";