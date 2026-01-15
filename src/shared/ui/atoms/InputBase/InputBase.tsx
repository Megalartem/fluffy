import React from "react";
import styles from "./InputBase.module.css";

type InputState = "default" | "focused" | "error" | "disabled";

export interface InputBaseProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightSlot?: React.ReactNode;
  /**
   * Optional ref to the underlying <input>. Useful when you can't (or don't want to)
   * pass a React `ref` prop to this component.
   */
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputBase = React.forwardRef<HTMLInputElement, InputBaseProps>(
  function InputBase(
    {
      state = "default",
      className = "",
      onChange,
      rightSlot,
      inputRef,
      disabled,
      ...props
    },
    ref
  ) {
    const assignRef = (
      target: React.Ref<HTMLInputElement> | undefined,
      node: HTMLInputElement | null
    ) => {
      if (!target) return;
      if (typeof target === "function") {
        target(node);
        return;
      }
      // Assign through a local variable to satisfy immutability lint rules.
      const refObj = target as React.RefObject<HTMLInputElement | null>;
      refObj.current = node;
    };

    const setRefs = (node: HTMLInputElement | null) => {
      assignRef(ref ?? undefined, node);
      assignRef(inputRef, node);
    };

    const isDisabled = disabled || state === "disabled";

    return (
      <div className={styles.wrapper}>
        <input
          {...props}
          ref={setRefs}
          disabled={isDisabled}
          data-state={state}
          onChange={onChange}
          aria-invalid={state === "error" ? true : undefined}
          className={[styles.input, className].filter(Boolean).join(" ")}
        />
        {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
      </div>
    );
  }
);

InputBase.displayName = "InputBase";
