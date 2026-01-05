

import { SegmentedControl } from '@/shared/ui/molecules';
import { Text } from '@/shared/ui/atoms';
import styles from '../TransactionsFilter.module.css';

export type TransactionsTypeFilter = "all" | "expense" | "income";


const TYPE_OPTIONS: Array<{ value: TransactionsTypeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];


export function TransactionTypeSection({
  value,
  onChange,
}: {
  value: TransactionsTypeFilter;
  onChange: (next: TransactionsTypeFilter) => void;
}) {
  return (
    <div className={styles.section}>
      <Text variant="label">Transaction type</Text>
      <SegmentedControl
        value={value}
        size="m"
        options={TYPE_OPTIONS}
        onChange={onChange}
      />
    </div>
  );
}

export default TransactionTypeSection;