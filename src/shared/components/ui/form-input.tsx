'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormField } from './form';
import { Input, type InputProps } from './input';

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'name' | 'error'> {
  control: Control<TFieldValues>;
  name: TName;
}

function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, type, ...inputProps }: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isNumber = type === 'number';
        return (
          <Input
            {...inputProps}
            type={type}
            {...field}
            onChange={(e) =>
              field.onChange(
                isNumber ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
              )
            }
            value={isNumber ? (field.value == null ? '' : field.value) : (field.value ?? '')}
            error={fieldState.error?.message}
          />
        );
      }}
    />
  );
}

export { FormInput };
export type { FormInputProps };
