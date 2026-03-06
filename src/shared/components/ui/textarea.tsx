import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base
        'flex field-sizing-content min-h-20 w-full rounded-lg border bg-background px-3 py-2.5 shadow-sm',
        'text-sm text-foreground placeholder:text-muted-foreground/70',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        // Hover
        'hover:border-border/80',
        // Focus
        'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20',
        // Aria invalid
        'aria-invalid:border-destructive/80 aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:ring-destructive/20',
        'border-border',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
