import React from "react";
import styles from "./TopBar.module.css";
import clsx from "clsx";
import { Heading, IconButton, type IconButtonProps } from "@/shared/ui/atoms";


export interface TopBarProps {
  title: string;
  subtitle?: string;
  leftAction?: IconButtonProps;
  rightAction?: IconButtonProps;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  className,
}) => {
  return (
    <header className={clsx(styles.root, className)}>
      <div className={styles.side}>
        {leftAction ? (
          <IconButton
            icon={leftAction.icon}
            variant="ghost"
            onClick={leftAction.onClick}
          />
        ) : (
          <div className={styles.iconPlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.center}>
        <Heading as="h1" variant="page" className={styles.title}>
          {title}
        </Heading>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>

      <div className={styles.side}>
        {rightAction ? (
          <IconButton
            icon={rightAction.icon}
            variant="ghost"
            onClick={rightAction.onClick}
          />
        ) : (
          <div className={styles.iconPlaceholder} aria-hidden="true" />
        )}
      </div>
    </header>
  );
};

TopBar.displayName = "TopBar";
