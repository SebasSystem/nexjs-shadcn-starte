'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { SelectField, type SelectFieldProps } from './select-field';

interface FormSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<SelectFieldProps, 'value' | 'onChange' | 'error'> {
  control: Control<TFieldValues>;
  name: TName;
}

function FormSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, ...selectProps }: FormSelectFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectField
          {...selectProps}
          value={field.value ?? ''}
          onChange={(val) => field.onChange(val)}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export { FormSelectField };
export type { FormSelectFieldProps };
