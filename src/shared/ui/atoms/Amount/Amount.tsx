import React from "react";
import styles from "./Amount.module.css";

type AmountState = "positive" | "negative" | "neutral";

interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  state?: AmountState;
  children: React.ReactNode;
}

export const Amount: React.FC<AmountProps> = ({
  state = "neutral",
  className = "",
  ...props
}) => {
  return (
    <span
      data-state={state}
      className={[styles.amount, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

Amount.displayName = "Amount";
