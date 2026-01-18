"use client";

import React, { useEffect, useId } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  easeOut,
} from "framer-motion";
import clsx from "clsx";
import styles from "./BottomSheet.module.css";
import { Overlay } from "@/shared/ui/atoms";

export type BottomSheetHeight = "auto" | "half" | "full";

export interface IBottomSheet {
  open: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  height?: BottomSheetHeight;
  className?: string;
}

export function BottomSheet({
  open,
  title,
  footer,
  children,
  onClose,
  dismissible = true,
  height = "auto",
  className,
}: IBottomSheet) {
  const titleId = useId();

  const [snapHeight, setSnapHeight] = React.useState<BottomSheetHeight>(height);
  const dragControls = useDragControls();

  const toggleSnap = React.useCallback(() => {
    setSnapHeight((prev) => (prev === "full" ? "half" : "full"));
  }, []);


  const reduceMotion = useReducedMotion();

  const overlayTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: easeOut };

  const sheetTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 42, mass: 0.9 };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, dismissible, onClose]);
  
  return (
    <AnimatePresence>
      {open && (
        <div className={styles.root} key={height}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          >
            <Overlay visible={true} onClick={dismissible ? onClose : undefined} />
          </motion.div>
          <motion.div
            className={clsx(
              styles.sheet,
              snapHeight === "auto" && styles.auto,
              snapHeight === "half" && styles.half,
              snapHeight === "full" && styles.full,
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            data-state="open"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={sheetTransition}
            layout
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const offsetY = info.offset.y;
              const velocityY = info.velocity.y;

              const SWIPE_DOWN_OFFSET = 80;
              const SWIPE_UP_OFFSET = -60;
              const SWIPE_VELOCITY = 800;

              const isSwipeDown = offsetY > SWIPE_DOWN_OFFSET || velocityY > SWIPE_VELOCITY;
              const isSwipeUp = offsetY < SWIPE_UP_OFFSET || velocityY < -SWIPE_VELOCITY;

              if (isSwipeUp) {
                setSnapHeight("full");
                return;
              }

              if (isSwipeDown) {
                if (snapHeight === "full") {
                  setSnapHeight("half");
                  return;
                }

                // half/auto -> close
                if (dismissible) {
                  onClose();
                } else {
                  // if not dismissible, just keep it at half
                  setSnapHeight("half");
                }
              }
            }}
          >
            <motion.div
              className={styles.handleWrap}
              style={{ touchAction: "none" }}
              onPointerDown={(e) => dragControls.start(e)}
              onClick={toggleSnap}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSnap();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Drag handle"
              aria-expanded={snapHeight === "full"}
            >
              <div className={styles.handle} />
            </motion.div>

            {title ? (
              <div id={titleId} className={styles.header}>
                {title}
              </div>
            ) : null}

            <div className={styles.body}>{children}</div>

            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}