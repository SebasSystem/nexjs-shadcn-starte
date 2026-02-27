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
      sm: 'h-8 text-xs px-3',
      md: 'h-10 text-sm px-3',
      lg: 'h-11 text-sm px-4',
    };

    const restingTranslateY = {
      sm: 'peer-placeholder-shown:translate-y-[6px]',
      md: 'peer-placeholder-shown:translate-y-2.5',
      lg: 'peer-placeholder-shown:translate-y-3',
    };

    const hasError = !!error;
    const isFloating = floatingLabel && label;

    return (
      <div className={cn('flex w-full flex-col gap-1.5 relative', className)}>
        {/* Label estático */}
        {label && !isFloating && (
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
            {...props}
            id={inputId}
            type={type}
            ref={ref}
            placeholder={isFloating ? ' ' : props.placeholder}
            aria-invalid={hasError ? 'true' : 'false'}
            className={cn(
              'flex w-full rounded-lg border bg-background text-foreground',
              'placeholder:text-muted-foreground/70',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              sizeClasses[size],
              leftIcon ? 'pl-10' : '',
              rightIcon || success ? 'pr-10' : '',
              isFloating ? 'peer' : '',
              hasError
                ? [
                    'border-destructive/80',
                    'focus-visible:outline-none focus-visible:border-destructive focus-visible:ring-[0.5px] focus-visible:ring-destructive',
                    'text-foreground placeholder:text-muted-foreground/50',
                  ]
                : success
                  ? [
                      'border-success/80',
                      'focus-visible:outline-none focus-visible:border-success focus-visible:ring-[0.5px] focus-visible:ring-success',
                    ]
                  : [
                      'border-border',
                      'hover:border-foreground',
                      'focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-[0.5px] focus-visible:ring-foreground',
                    ]
            )}
            {...props}
          />

          {isFloating && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute pointer-events-none cursor-text origin-top-left z-10 bg-background px-1',
                'transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0.0,1.0)]',
                'top-0 left-0 text-sm will-change-transform',

                // Resting State: Use Size-based Y transform and Icon-based X transform, Normal scale
                restingTranslateY[size],
                leftIcon
                  ? 'peer-placeholder-shown:translate-x-9'
                  : 'peer-placeholder-shown:translate-x-2.5',
                'peer-placeholder-shown:scale-100 peer-placeholder-shown:text-muted-foreground/70',

                // Active State (Focused or Has text): Fixed Top Y, slight X shift, Scaled down
                'peer-focus:-translate-y-1/2 peer-focus:translate-x-2.5 peer-focus:scale-[0.8]',
                'peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:translate-x-2.5 peer-[:not(:placeholder-shown)]:scale-[0.8]',

                // Color: base is label-gray, turns dark only on focus
                hasError
                  ? 'text-destructive peer-focus:text-destructive'
                  : ['text-grey-600', 'peer-focus:text-foreground']
              )}
            >
              {label}
              {props.required && <span className="ml-1 text-destructive">*</span>}
            </label>
          )}

          {(rightIcon || success) && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
              {success && !rightIcon ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {hint && !error && (
          <p className="text-[0.75rem] text-muted-foreground leading-tight">{hint}</p>
        )}
        {error && (
          <p className="text-[0.75rem] font-medium text-destructive leading-tight">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
