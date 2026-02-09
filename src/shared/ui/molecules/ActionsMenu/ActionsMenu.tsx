"use client";

import React from "react";
import clsx from "clsx";
import {
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  Button,
} from "react-aria-components";
import { MoreVertical, type LucideIcon } from "lucide-react";

import { Icon } from "@/shared/ui/atoms";
import styles from "./ActionsMenu.module.css";

export type ActionMenuItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "danger";
  hidden?: boolean;
  disabled?: boolean;
  onAction?: () => void;
};

export type ActionMenuProps = {
  ariaLabel?: string;

  /** Items rendered in order (hidden items are skipped) */
  items: ActionMenuItem[];

  /** Called with item.id */
  onAction: (id: string) => void;

  /** Override trigger icon */
  triggerIcon?: LucideIcon;

  /** Disable whole menu */
  disabled?: boolean;

  /** Optional classNames */
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  menuClassName?: string;
};

export function ActionMenu({
  ariaLabel = "Actions",
  items,
  triggerIcon: TriggerIcon = MoreVertical,
  disabled = false,
  className,
  triggerClassName,
  popoverClassName,
  menuClassName,
  onAction,
}: ActionMenuProps) {
  const visibleItems = items.filter((i) => !i.hidden);

  const byId = React.useMemo(() => {
    const m = new Map<string, ActionMenuItem>();
    for (const it of visibleItems) m.set(it.id, it);
    return m;
  }, [visibleItems]);

  const handleAction = React.useCallback(
    (key: React.Key) => {
      const id = String(key);
      onAction?.(id);
      byId.get(id)?.onAction?.();
    },
    [byId, onAction]
  );

  return (
    <div className={clsx(styles.root, className)}>
      <MenuTrigger>
        <Button
          aria-label={ariaLabel}
          className={clsx(styles.trigger, triggerClassName)}
          isDisabled={disabled}
        >
          <Icon icon={TriggerIcon} size="m" />
        </Button>

        <Popover
          className={clsx(styles.popover, popoverClassName)}
          placement="bottom end"
          offset={8}
        >
          <Menu
            className={clsx(styles.menu, menuClassName)}
            onAction={handleAction}
            aria-label={ariaLabel}
          >
            {visibleItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  className={clsx(
                    styles.item,
                    item.variant === "danger" && styles.dangerItem
                  )}
                  isDisabled={item.disabled}
                >
                  {ItemIcon ? <ItemIcon className={styles.itemIcon} /> : null}
                  <span>{item.label}</span>
                </MenuItem>
              );
            })}
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}

ActionMenu.displayName = "ActionMenu";