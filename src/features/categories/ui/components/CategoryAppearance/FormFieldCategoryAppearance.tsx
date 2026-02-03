"use client";

import * as React from "react";
import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { CategoryAppearance } from "./CategoryAppearance";
import type { CategoryColor } from "../../../model/types";
import type { IconName } from "lucide-react/dynamic";

export interface IFormFieldCategoryAppearance<T extends FieldValues> {
  /** RHF field name for icon */
  iconFieldName: FieldPath<T>;
  /** RHF field name for color */
  colorFieldName: FieldPath<T>;

  /** Validation rules for icon */
  iconRules?: RegisterOptions<T>;
  /** Validation rules for color */
  colorRules?: RegisterOptions<T>;

  /** Callback when icon picker should open */
  onIconClick: () => void;
}

export function FormFieldCategoryAppearance<T extends FieldValues>({
  iconFieldName,
  colorFieldName,
  iconRules,
  colorRules,
  onIconClick,
}: IFormFieldCategoryAppearance<T>) {
  const { control } = useFormContext<T>();

  const { field: iconField } = useController({
    control,
    name: iconFieldName,
    rules: iconRules,
  });

  const { field: colorField } = useController({
    control,
    name: colorFieldName,
    rules: colorRules,
  });

  const handleColorChange = React.useCallback(
    (nextColor: CategoryColor) => colorField.onChange(nextColor),
    [colorField]
  );

  return (
    <CategoryAppearance
      iconKey={iconField.value as IconName}
      colorId={colorField.value as CategoryColor}
      onChangeColor={handleColorChange}
      onIconClick={onIconClick}
    />
  );
}

FormFieldCategoryAppearance.displayName = "FormFieldCategoryAppearance";
