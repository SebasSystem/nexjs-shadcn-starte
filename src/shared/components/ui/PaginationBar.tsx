'use client';

import { useMemo } from 'react';
import { cn } from 'src/lib/utils';
import { Icon } from 'src/shared/components/ui/icon';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationBar({ page, totalPages, onPageChange, className }: PaginationBarProps) {
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: (number | 'ellipsis')[] = [];
    items.push(1);

    if (page > 3) items.push('ellipsis');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (page < totalPages - 2) items.push('ellipsis');

    items.push(totalPages);

    return items;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="ChevronLeft" size={16} />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="w-8 text-center text-sm text-muted-foreground select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex items-center justify-center size-8 rounded-full text-sm font-medium transition-colors',
              p === page ? 'bg-foreground text-background' : 'text-foreground hover:bg-muted'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="ChevronRight" size={16} />
      </button>
    </div>
  );
}
