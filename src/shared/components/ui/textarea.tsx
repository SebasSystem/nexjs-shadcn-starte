import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base
        'flex field-sizing-content min-h-20 w-full rounded-lg border bg-background px-3 py-2.5',
        'text-sm text-foreground placeholder:text-muted-foreground/70',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        // Hover
        'hover:border-foreground',
        // Focus
        'focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-[0.5px] focus-visible:ring-foreground',
        // Aria invalid
        'aria-invalid:border-destructive/80 aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-[0.5px] aria-invalid:focus-visible:ring-destructive',
        'border-border',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
