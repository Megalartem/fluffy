import React from "react";
import clsx from "clsx";
import styles from "./ModalHeader.module.css";
import { Heading, IconButton } from "@/shared/ui/atoms";
import { X } from "lucide-react";

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  className,
}) => {
  return (
    <div className={clsx(styles.root, className)}>
      <Heading as="h2" variant="section" className={styles.title}>
        {title}
      </Heading>

      <IconButton
        icon={X}
        ariaLabel="Закрыть"
        onClick={onClose}
        size="m"
        variant="ghost"
      />
    </div>
  );
};

ModalHeader.displayName = "ModalHeader";