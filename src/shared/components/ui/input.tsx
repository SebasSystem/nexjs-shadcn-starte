import * as React from 'react';

import { cn } from 'src/lib/utils';
import { Icon } from './icon';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
  error?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, leftIcon, rightIcon, hint, error, success, size = 'md', id, inputClassName, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const sizeClasses = {
      sm: 'h-8 text-xs px-3',
      md: 'h-10 text-sm px-3',
      lg: 'h-11 text-sm px-4',
    };

    const hasError = !!error;
    const describedBy =
      [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground leading-none">
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full group">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none z-10 transition-colors duration-200 group-focus-within:text-foreground',
                hasError && 'text-destructive group-focus-within:text-destructive',
                success && 'text-success group-focus-within:text-success'
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn(
              'flex w-full rounded-lg border bg-background text-foreground shadow-sm',
              'placeholder:text-muted-foreground/70',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              sizeClasses[size],
              leftIcon && 'pl-10',
              (rightIcon || success) && 'pr-10',
              inputClassName,
              hasError
                ? 'border-destructive/80 focus-visible:outline-none focus-visible:border-destructive focus-visible:ring-[3px] focus-visible:ring-destructive/20'
                : success
                  ? 'border-success/80 focus-visible:outline-none focus-visible:border-success focus-visible:ring-[3px] focus-visible:ring-success/20'
                  : 'border-border hover:border-border/80 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20'
            )}
            {...props}
          />

          {(rightIcon || success) && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
              {success && !rightIcon ? (
                <Icon name="CheckCircle2" size={16} className="text-success" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {hint && !hasError && (
          <p id={hintId} className="text-[0.75rem] text-muted-foreground leading-tight">
            {hint}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="text-[0.75rem] font-medium text-destructive leading-tight">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
