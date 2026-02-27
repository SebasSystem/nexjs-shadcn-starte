import { ReactNode } from 'react';
import { cn } from 'src/lib/utils';
import { Checkbox } from 'src/shared/components/ui';

interface Props {
  numSelected: number;
  rowCount: number;
  onSelectAllRows: (checked: boolean) => void;
  action?: ReactNode;
  className?: string;
}

export function TableSelectedAction({
  action,
  className,
  rowCount,
  numSelected,
  onSelectAllRows,
}: Props) {
  if (!numSelected) return null;

  return (
    <div
      className={cn(
        'absolute top-0 right-0 left-0 z-20 flex h-[60px] sm:h-[56px] lg:h-[60px] items-center bg-background px-4 transition-all duration-200',
        className
      )}
    >
      {/* Opaque solid background with primary tint */}
      <div className="absolute inset-0 bg-primary/10 pointer-events-none" />

      <div className="relative z-10 flex w-full items-center">
        <Checkbox
          checked={numSelected === rowCount && rowCount > 0}
          onCheckedChange={(checked) => onSelectAllRows(checked === true)}
          aria-label="Select all"
          className="mr-2"
        />

        <span className="ml-2 text-sm font-semibold text-primary">{numSelected} selected</span>

        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
}
