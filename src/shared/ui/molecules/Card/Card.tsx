import React from "react";
import { Surface, type SurfaceBgVariant } from "@/shared/ui/atoms";
import styles from "./Card.module.css";
import clsx from "clsx";

export type CardVariant = "default" | "ghost";
export type CardPadding = "md" | "lg";

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  bgVariant?: SurfaceBgVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  bgVariant = "default",
  className,
  children,
  onClick,
}) => {
  return (
    <Surface
      variant={variant}
      bgVariant={bgVariant}
      data-padding={padding}
      className={clsx(styles.card, className)}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </Surface>
  );
};

Card.displayName = "Card";