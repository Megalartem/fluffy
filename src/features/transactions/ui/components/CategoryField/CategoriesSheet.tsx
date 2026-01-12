import { OptionBaseProps } from "@/shared/ui/atoms";
import { BottomSheet, ModalHeader, OptionControl } from "@/shared/ui/molecules";



export function CategoriesSheet({
  open,
  title,
  onClose,
  options,
  chosenOptions,
  onChange,
  onApply,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  options: OptionBaseProps[];
  chosenOptions: OptionBaseProps[] | null;
  onChange: (val: OptionBaseProps[] | null) => void;
  onApply: (chosen: OptionBaseProps[] | null) => void;
}) {
  return (
    <BottomSheet
      open={open}
      title={<ModalHeader title={title} onClose={onClose} />}
      height="half"
      onClose={onClose}
    >
      <OptionControl
        mode="multi"
        options={options}
        chosenOptions={chosenOptions}
        onChange={onChange}
        onApply={onApply}
      />
    </BottomSheet>
  );
}