/**
 * Input - Design System Input Component
 *
 * Types: text, number, decimal
 * States: error, disabled, focused
 * Features: labels, helper text, Russian placeholders
 */

import React from "react";
import { cn } from "@/lib/utils"; // or similar utility

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      icon,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 border rounded-xl",
              "text-sm transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "placeholder:text-gray-400",
              error
                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
              disabled && "bg-gray-50 cursor-not-allowed opacity-60",
              icon ? "pl-10" : "",
              className
            )}
            {...props}
          />

          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
