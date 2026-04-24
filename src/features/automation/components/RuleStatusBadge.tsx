'use client';

import { cn } from 'src/lib/utils';

interface RuleStatusBadgeProps {
  enabled: boolean;
  className?: string;
}

export function RuleStatusBadge({ enabled, className }: RuleStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        enabled
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          enabled ? 'bg-emerald-500' : 'bg-muted-foreground/50'
        )}
      />
      {enabled ? 'Activa' : 'Inactiva'}
    </span>
  );
}
