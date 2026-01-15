

import { SegmentedControl } from '@/shared/ui/molecules';
import { Text } from '@/shared/ui/atoms';
import styles from './TransactionTypeField.module.css';

export type TransactionsTypes = "all" | "expense" | "income";

export interface TransactionTypeOption {
    value: TransactionsTypes;
    label: string;
}


const TYPE_OPTIONS: Array<TransactionTypeOption> = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

interface TransactionTypeFieldProps {
    value: TransactionsTypes;
    onChange: (next: TransactionsTypes) => void;
    options?: TransactionTypeOption[];
}


export function TransactionTypeField({
  value,
  onChange,
  options = TYPE_OPTIONS,
}: TransactionTypeFieldProps) {
  return (
    <div className={styles.section}>
      <Text variant="label">Transaction type</Text>
      <SegmentedControl
        value={value}
        size="m"
        options={options}
        onChange={onChange}
      />
    </div>
  );
}

export default TransactionTypeField;