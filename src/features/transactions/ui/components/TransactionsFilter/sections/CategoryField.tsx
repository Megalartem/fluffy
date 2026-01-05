import { OptionBaseProps } from "@/shared/ui/atoms";
import styles from '../TransactionsFilter.module.css';
import { FormSelectField } from "@/shared/ui/molecules";




export function CategoryField({
  values,
  isOpen,
  onOpen,
  onRemove,
}: {
  values: OptionBaseProps[];
  isOpen: boolean;
  onOpen: () => void;
  onRemove: (removed: OptionBaseProps) => void;
}) {
  return (
    <div className={styles.section}>
      <FormSelectField
        label="Category"
        mode="multi"
        values={values}
        isOpen={isOpen}
        placeholder="All categories"
        onClick={onOpen}
        onRemoveValue={onRemove}
      />
    </div>
  );
}

export default CategoryField;