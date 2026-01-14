import { OptionBaseProps } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader, OptionControl } from "@/shared/ui/molecules";

type OptionMode = "single" | "multi";

interface CategoriesSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  options: OptionBaseProps[];
  chosenOptions: OptionBaseProps[] | null;
  onChange: (val: OptionBaseProps[] | null) => void;
  onApply: (chosen: OptionBaseProps[] | null) => void;
  mode?: OptionMode;
}

export function CategoriesSheet({
  open,
  title,
  onClose,
  options,
  chosenOptions,
  onChange,
  onApply,
  mode = "multi",
}: CategoriesSheetProps) {
  return (
    <BottomSheet
      open={open}
      title={<ModalHeader title={title} onClose={onClose} />}
      height="half"
      onClose={onClose}
    >
      <OptionControl
        mode={mode}
        options={options}
        chosenOptions={chosenOptions}
        onChange={onChange}
        onApply={onApply}
      />
    </BottomSheet>
  );
}