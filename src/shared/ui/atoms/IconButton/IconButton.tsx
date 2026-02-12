import React from "react";
import type { LucideIcon } from "lucide-react";
import { ButtonBase, type ButtonBaseProps, type ButtonSize, type ButtonVariant } from "../ButtonBase/ButtonBase";
import { Icon, type IconSize, type IconVariant } from "../Icon/Icon";
import styles from "./IconButton.module.css";
import clsx from "clsx";

export type IconButtonVariant = "default" | "muted" | "ghost";

export interface IconButtonProps extends ButtonBaseProps {
  icon: LucideIcon;

  /** Unified variant that controls BOTH the button container and the icon color */
  variant?: IconButtonVariant;

  /** Button size controls padding + default iconSize */
  size?: ButtonSize; // "s" | "m"

  /** Optional: override icon size (otherwise derived from button size) */
  iconSize?: IconSize; // "s" | "m" | "l"
}

const VARIANT_MAP: Record<IconButtonVariant, { button: ButtonVariant; icon: IconVariant }> = {
  default: { button: "default", icon: "on-default" },
  muted: { button: "muted", icon: "muted" },
  ghost: { button: "ghost", icon: "muted" }
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "default",
  size = "m",
  iconSize,
  className = "",
  ...props
}) => {
  const mapped = VARIANT_MAP[variant];

  const resolvedIconSize: IconSize = iconSize ?? (size === "s" ? "s" : "m");

  return (
    <ButtonBase
      {...props}
      size={size}
      variant={mapped.button}
      data-size={size}
      className={clsx(styles.button, className)}
    >
      <Icon icon={icon} size={resolvedIconSize} variant={mapped.icon} />
    </ButtonBase>
  );
};

IconButton.displayName = "IconButton";
