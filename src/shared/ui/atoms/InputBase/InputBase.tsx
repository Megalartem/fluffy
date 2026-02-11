import React from "react";
import styles from "./InputBase.module.css";

type InputState = "default" | "focused" | "error" | "disabled";

export interface InputBaseProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  /**
   * Visual state override. In normal usage you should NOT pass "focused".
   * Focus styles are handled by :focus-visible in CSS.
   */
  state?: Exclude<InputState, "focused">;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rightSlot?: React.ReactNode;
  /**
   * Optional ref to the underlying <input>. Useful when you can't (or don't want to)
   * pass a React `ref` prop to this component.
   */
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;

  multiline?: boolean; // for future use, e.g. to switch to a textarea
}

export const InputBase = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputBaseProps>(
  function InputBase(
    {
      state = "default",
      className = "",
      onChange,
      rightSlot,
      inputRef,
      disabled,
      multiline = false,
      ...props
    },
    ref
  ) {
    const assignRef = (
      target: React.Ref<HTMLInputElement | HTMLTextAreaElement> | undefined,
      node: HTMLInputElement | HTMLTextAreaElement | null
    ) => {
      if (!target) return;
      if (typeof target === "function") {
        target(node);
        return;
      }
      // Assign through a local variable to satisfy immutability lint rules.
      const refObj = target as React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
      refObj.current = node;
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (state === "disabled") return;
      if (multiline) {
        (e.target as HTMLTextAreaElement).value = e.target.value;
      } else {
        (e.target as HTMLInputElement).value = e.target.value;
      }
      onChange?.(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
    };

    const setRefs = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      assignRef(ref ?? undefined, node as unknown as HTMLInputElement | HTMLTextAreaElement);
      assignRef(inputRef, node as unknown as HTMLInputElement | HTMLTextAreaElement);
    };

    const isDisabled = disabled || state === "disabled";

    return (
      <div className={styles.wrapper}>
        {multiline ? (
          <textarea
            {...props}
            ref={setRefs}
            disabled={isDisabled}
            data-state={state}
            onChange={onChangeHandler}
            aria-invalid={state === "error" ? true : undefined}
            className={[styles.input, className].filter(Boolean).join(" ")}
          />
        ) : (
          <input
            {...props}
            ref={setRefs}
            disabled={isDisabled}
            data-state={state}
            onChange={onChangeHandler}
            aria-invalid={state === "error" ? true : undefined}
            className={[styles.input, className].filter(Boolean).join(" ")}
          />
        )}
        {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
      </div>
    );
  }
);

InputBase.displayName = "InputBase";
