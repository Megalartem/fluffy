import { ModalHeader, SortControl, SortSheet } from "@/shared/ui/molecules";

export type TransactionsSortOption = {
  key: string;
  label: string;
};

export type TransactionsSortValue = {
  key: string | null;
  direction: "asc" | "desc" | null;
};

export function SortOptionsSheet({
  open,
  onClose,
  sortOptions,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  sortOptions: TransactionsSortOption[];
  value: TransactionsSortValue;
  onChange: (next: TransactionsSortValue) => void;
}) {
  return (
    <SortSheet
      open={open}
      onClose={onClose}
      title={<ModalHeader title="Сортировка" onClose={onClose} />}
    >
      <SortControl options={sortOptions} value={value} onChange={onChange} />
    </SortSheet>
  );
}

export default SortOptionsSheet;