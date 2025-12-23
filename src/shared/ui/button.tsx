/**
 * Button - Design System Button Component
 *
 * Variants: primary, secondary, danger, ghost
 * Sizes: sm, md, lg
 * States: loading, disabled
 * Icon support with react-icons
 */

import React from "react";
import { cn } from "@/lib/utils"; // or similar utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles = {
  primary: "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400",
  secondary: "bg-gray-100 text-black hover:bg-gray-200 disabled:bg-gray-200",
  danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
  ghost: "bg-transparent text-black hover:bg-gray-100 disabled:bg-transparent disabled:opacity-50",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs rounded-lg",
  md: "px-3 py-2 text-sm rounded-xl",
  lg: "px-4 py-3 text-base rounded-2xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className={loading ? "opacity-0" : ""}>{icon}</span>
        )}

        {loading && (
          <span className="absolute">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {children}

        {icon && iconPosition === "right" && (
          <span className={loading ? "opacity-0" : ""}>{icon}</span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          loading && "relative",
          className
        )}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
