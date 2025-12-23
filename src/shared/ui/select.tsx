/**
 * Select - Design System Select Component
 *
 * Features:
 * - Single and multi-select
 * - Search/filter capability
 * - Empty states
 * - Async loading support
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils"; // or similar utility

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multi?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Выберите опцию",
      label,
      error,
      disabled = false,
      multi = false,
      searchable = true,
      clearable = true,
      loading = false,
      emptyMessage = "Нет опций",
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedValues, setSelectedValues] = useState<
      (string | number)[]
    >(
      Array.isArray(value)
        ? value
        : value !== undefined && value !== null
        ? [value]
        : []
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search query
    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Get display text
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;

      const selected = options.filter((opt) =>
        selectedValues.includes(opt.value)
      );

      if (multi) {
        return selected.length > 0
          ? `${selected.length} выбрано`
          : placeholder;
      }

      return selected[0]?.label || placeholder;
    };

    // Handle selection
    const handleSelect = (optionValue: string | number) => {
      const option = options.find((opt) => opt.value === optionValue);
      if (option?.disabled) return;

      let newValues: (string | number)[];

      if (multi) {
        newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
      } else {
        newValues = [optionValue];
        setIsOpen(false);
      }

      setSelectedValues(newValues);
      onChange?.(multi ? newValues : newValues[0]);
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onChange?.(multi ? [] : (undefined as any));
      setSearchQuery("");
    };

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Trigger Button */}
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled || loading}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full px-3 py-2 border rounded-xl text-left",
              "flex items-center justify-between",
              "text-sm transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200",
              (disabled || loading) && "bg-gray-50 cursor-not-allowed opacity-60"
            )}
          >
            <span className={selectedValues.length === 0 ? "text-gray-400" : ""}>
              {getDisplayText()}
            </span>

            <div className="flex items-center gap-1">
              {clearable && selectedValues.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Clear selection"
                >
                  ×
                </button>
              )}

              <svg
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 border border-gray-200 rounded-xl bg-white shadow-lg z-50">
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-gray-100">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Поиск…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}

              {/* Options List */}
              <ul className="max-h-60 overflow-auto">
                {loading ? (
                  <li className="px-3 py-2 text-center text-sm text-gray-500">
                    Загрузка…
                  </li>
                ) : filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-center text-sm text-gray-500">
                    {emptyMessage}
                  </li>
                ) : (
                  filteredOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm",
                          "transition-colors hover:bg-gray-50",
                          selectedValues.includes(option.value) &&
                            "bg-blue-50 font-medium",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {multi && (
                          <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            onChange={() => {}}
                            disabled={option.disabled}
                            className="mr-2"
                          />
                        )}
                        {option.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
