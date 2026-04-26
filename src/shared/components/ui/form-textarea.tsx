'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormField } from './form';
import { Textarea, type TextareaProps } from './textarea';

interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextareaProps, 'name' | 'error'> {
  control: Control<TFieldValues>;
  name: TName;
}

function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, ...textareaProps }: FormTextareaProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Textarea {...textareaProps} {...field} error={fieldState.error?.message} />
      )}
    />
  );
}

export { FormTextarea };
export type { FormTextareaProps };
