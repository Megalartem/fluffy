"use client";

import React from "react";
import clsx from "clsx";
import { MenuTrigger, Popover, Menu, MenuItem, Button } from "react-aria-components";
import { MoreVertical, type LucideIcon } from "lucide-react";

import { Icon } from "@/shared/ui/atoms";
import styles from "./ActionMenu.module.css";

export type ActionMenuItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "danger";
  hidden?: boolean;
  disabled?: boolean;

  /** Item-level handler (preferred) */
  onAction?: () => void;
};

export type ActionMenuProps = {
  ariaLabel?: string;

  /** Items rendered in order (hidden items are skipped) */
  items: ActionMenuItem[];

  /**
   * Optional global handler (analytics/logging).
   * Prefer item.onAction for business behavior.
   */
  onAction?: (id: string) => void;

  /** Default trigger icon (used only if trigger is not provided) */
  triggerIcon?: LucideIcon;

  /** Provide custom trigger (e.g. row, icon button, etc.) */
  triggerButtonBody?: React.ReactNode;

  /** Disable whole menu */
  disabled?: boolean;

  /** Controlled open state */
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Optional classNames */
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  menuClassName?: string;

  /** Popover positioning */
  placement?: React.ComponentProps<typeof Popover>["placement"];
  offset?: number;
};

export function ActionMenu({
  ariaLabel = "Actions",
  items,
  onAction,
  triggerIcon: TriggerIcon = MoreVertical,
  triggerButtonBody,
  disabled = false,

  isOpen,
  defaultOpen,
  onOpenChange,

  className,
  triggerClassName,
  popoverClassName,
  menuClassName,

  placement = "bottom end",
  offset = 8,
}: ActionMenuProps) {
  const visibleItems = React.useMemo(() => items.filter((i) => !i.hidden), [items]);

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

  const triggerBody = triggerButtonBody ? (
    triggerButtonBody
  ) : (
      <Icon icon={TriggerIcon} size="m" />
  );

  return (
    <div className={clsx(styles.root, className)}>
      <MenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Button
          aria-label={ariaLabel}
          className={clsx(styles.trigger, triggerClassName)}
          isDisabled={disabled}
        >
          {triggerBody}
        </Button>

        <Popover
          className={clsx(styles.popover, popoverClassName)}
          placement={placement}
          offset={offset}
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