import React from 'react';
import styles from './Text.module.css';
import clsx from 'clsx';

type TextVariant = 'body' | 'caption' | 'label' | 'muted';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        styles.text,
        styles[variant],
        className
      )}
      {...props}
    />
  );
};

Text.displayName = 'Text';