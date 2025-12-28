import React from "react";
import { Search, X } from "lucide-react";
import { InputBase, InputBaseProps } from "../InputBase/InputBase";
import styles from "./SearchInput.module.css";

interface SearchInputProps extends InputBaseProps {
  
  onClear?: () => void;
}

export function SearchInput({
  onClear,
  className = "",
  value,
  ...props
}: SearchInputProps) {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div className={styles.root}>
      <Search className={styles.searchIcon} size={20} />

      <InputBase
        type="search"
        placeholder="Search"
        value={value}
        className={[styles.input, className].filter(Boolean).join(" ")}
        {...props}
      />

      {hasValue && onClear ? (
          <X 
          type="button"
          aria-label="Очистить поиск"
          className={styles.clearButton}
          onClick={onClear}
          size={16}
          />
      ) : null}
    </div>
  );
}

SearchInput.displayName = "SearchInput";
