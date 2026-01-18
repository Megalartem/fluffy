import React from "react";
import styles from "./CategoryIcon.module.css";
import { CategoryColor } from "@/features/categories/model/types";


type CategorySize = "xs" | "s" | "m" | "l";
type Importance = "primary" | "secondary";

interface CategoryIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: CategorySize;
  color?: CategoryColor;
  backgroundColor?: string;
  importance?: Importance;
}

const mapBackgroundToColor = (v?: string): CategoryColor => {
  switch (v) {
    case "bg-status-success": return "green";
    case "bg-status-warning": return "amber";
    case "bg-status-error":   return "red";
    // allow passing direct palette names too
    case "default":
    case "violet": case "indigo": case "blue": case "cyan": case "teal":
    case "amber": case "orange": case "coral": case "red":
    case "green": case "lime": case "mint":
    case "pink": case "magenta": case "plum":
    case "slate": case "steel": case "graphite": case "sand": case "brown":
      return v as CategoryColor;
    default:
      return "default";
  }
};

export function CategoryIcon({
  icon: Icon,
  size = "m",
  color,
  backgroundColor,
  importance = "secondary",
  className,
  ...rest
}: CategoryIconProps) {
  const resolvedColor = color ?? mapBackgroundToColor(backgroundColor);

  return (
    <div
      {...rest}
      data-size={size}
      data-color={resolvedColor}
      data-importance={importance}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      <Icon className={styles.icon} />
    </div>
  );
}

CategoryIcon.displayName = "CategoryIcon";
