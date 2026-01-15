import { OptionBaseProps } from "@/shared/ui/atoms";
import { FormSelectField } from "@/shared/ui/molecules";


interface CategoryFieldProps {
  mode?: "single" | "multi";
  values: OptionBaseProps[];
  isOpen: boolean;
  onOpen: () => void;
  onRemove: (removed: OptionBaseProps) => void;
}

export function CategoryField({
  mode = "multi",
  values,
  isOpen,
  onOpen,
  onRemove,
}: CategoryFieldProps) {
  return (
    <div>
      <FormSelectField
        label="Category"
        mode={mode}
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