import { ButtonBase, OptionBaseProps } from "@/shared/ui/atoms";
import { BottomSheet, Modal, ModalActions, ModalHeader, OptionControl } from "@/shared/ui/molecules";
import { useCallback } from "react";

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
      footer={
        <ModalActions
          primary={{
            label: "Apply",
            onClick: () => onApply(chosenOptions),
          }}
          secondary={{
            label: "Cancel",
            onClick: onClose,
          }}
          layout="row"
        />
      }
        
    >
      <OptionControl
        mode={mode}
        options={options}
        chosenOptions={chosenOptions}
        onChange={onChange}
      />
    </BottomSheet>
  );
}