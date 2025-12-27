import React from "react";
import styles from "./Heading.module.css";

export type HeadingVariant = "page" | "section" | "amount";

interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeadingVariant;
  as?: "h1" | "h2" | "h3" | "div" | "span";
}

export const Heading: React.FC<HeadingProps> = ({
  variant = "section",
  as,
  className = "",
  ...props
}) => {
  const Tag = (as ?? (variant === "page" ? "h1" : variant === "section" ? "h2" : "h3")) as React.ElementType;

  return (
    <Tag
      data-variant={variant}
      className={[styles.heading, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Heading.displayName = "Heading";
