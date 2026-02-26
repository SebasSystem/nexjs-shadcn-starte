import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';

import { cn } from 'src/lib/utils';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  floatingLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
  error?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      floatingLabel,
      leftIcon,
      rightIcon,
      hint,
      error,
      success,
      size = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const sizeClasses = {
      sm: 'h-8 text-xs px-2',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-base px-4',
    };

    const hasError = !!error;
    const isFloating = floatingLabel && label;

    return (
      <div className={cn('flex w-full flex-col gap-1.5 relative', className)}>
        {label && !isFloating && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            placeholder={isFloating ? ' ' : props.placeholder}
            aria-invalid={hasError ? 'true' : 'false'}
            className={cn(
              'flex w-full rounded-md border bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              leftIcon ? 'pl-10' : '',
              rightIcon || success ? 'pr-10' : '',
              hasError
                ? 'border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/60'
                : success
                  ? 'border-green-500 focus-visible:ring-green-500'
                  : 'border-input focus-visible:ring-ring focus-visible:border-input',
              isFloating ? 'peer pt-4 pb-1' : ''
            )}
            {...props}
          />

          {isFloating && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute bg-transparent px-1 transition-all duration-200 pointer-events-none',
                'text-muted-foreground peer-focus:text-primary',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm',
                'top-1 -translate-y-1/2 text-[10px]',
                leftIcon ? 'left-10' : 'left-3',
                hasError ? 'text-destructive peer-focus:text-destructive' : ''
              )}
            >
              {label}
              {props.required && <span className="ml-1 text-destructive">*</span>}
            </label>
          )}

          {(rightIcon || success) && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
              {success && !rightIcon ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {hint && !error && <p className="text-[0.8rem] text-muted-foreground">{hint}</p>}
        {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
