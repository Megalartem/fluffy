import * as React from "react";
import styles from "./ProgressRing.module.css";
import { GoalColor } from "@/features/goals/model/types";

export type ProgressRingSize = "s" | "m" | "l" | "xl" | "xxl";

export type ProgressRingProps = {
  value: number; // 0..1
  size?: ProgressRingSize; // default: m
  label?: string;
  ariaLabel?: string;
  color?: GoalColor; // CSS color value for progress stroke
  className?: string;
};

const SIZE_CONFIG: Record<
  ProgressRingSize,
  { diameter: number; stroke: number; labelSize: number }
> = {
  s: { diameter: 40, stroke: 6, labelSize: 10 },
  m: { diameter: 56, stroke: 8, labelSize: 12 },
  l: { diameter: 72, stroke: 10, labelSize: 14 },
  xl: { diameter: 96, stroke: 12, labelSize: 16 },
  xxl: { diameter: 160, stroke: 16, labelSize: 24 },
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function ProgressRing({
  value,
  size = "m",
  label,
  ariaLabel,
  color = "default",
  className,
}: ProgressRingProps) {
  const v = clamp01(value);
  const { diameter, stroke, labelSize } = SIZE_CONFIG[size];

  const geometry = React.useMemo(() => {
    const r = (diameter - stroke) / 2;
    const c = 2 * Math.PI * r;
    return { r, c };
  }, [diameter, stroke]);

  const [dashOffset, setDashOffset] = React.useState(geometry.c);
  const [isMounted, setIsMounted] = React.useState(false);
  const isMountedRef = React.useRef(false);

  // Reset mounted state on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Animate on mount and value changes
  React.useEffect(() => {
    const targetOffset = geometry.c * (1 - v);
    
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setIsMounted(true);
      const id = requestAnimationFrame(() => {
        setDashOffset(targetOffset);
      });
      return () => cancelAnimationFrame(id);
    }
    
    setDashOffset(targetOffset);
  }, [v, geometry.c]);

  const containerStyle = React.useMemo(
    () => ({
      width: diameter,
      height: diameter,
      "--goal-ring-label-size": `${labelSize}px`,
    } as React.CSSProperties),
    [diameter, labelSize]
  );

  const a11y = React.useMemo(
    () => ariaLabel ?? (label ? `Progress ${label}` : "Progress"),
    [ariaLabel, label]
  );

  const rootClassName = React.useMemo(
    () => (className ? `${styles.root} ${className}` : styles.root),
    [className]
  );

  const progressClassName = React.useMemo(
    () => `${styles.progress} ${isMounted ? styles.animated : styles.instant}`,
    [isMounted]
  );

  const half = diameter / 2;

  return (
    <div
      className={rootClassName}
      style={containerStyle}
      role="img"
      aria-label={a11y}
    >
      <svg
        width={diameter}
        height={diameter}
        className={styles.svg}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        <circle
          className={styles.track}
          cx={half}
          cy={half}
          r={geometry.r}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className={progressClassName}
          data-color={color ?? "default"}
          cx={half}
          cy={half}
          r={geometry.r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={geometry.c}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {label && <div className={styles.label} data-size={size}>{label}</div>}
    </div>
  );
}