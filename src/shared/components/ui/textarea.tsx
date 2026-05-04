import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  hint?: string;
  error?: string;
}

function Textarea({ className, label, hint, error, id, required, ...props }: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const hasError = !!error;
  const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-foreground leading-none">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        data-slot="textarea"
        className={cn(
          'flex field-sizing-content min-h-20 w-full rounded-lg border bg-background px-3 py-2.5 shadow-sm',
          'text-sm text-foreground placeholder:text-muted-foreground/70',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          'hover:border-border/80',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20',
          hasError
            ? 'border-destructive/80 focus-visible:border-destructive focus-visible:ring-destructive/20'
            : 'border-border',
          className
        )}
        {...props}
      />
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

export { Textarea };
