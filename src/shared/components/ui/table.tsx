'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const DenseContext = React.createContext(false);

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-[#f4f6f8] dark:bg-[#28323d] [&_tr]:border-none', className)}
      {...props}
    />
  );
}

function TableBody({
  className,
  dense,
  ...props
}: React.ComponentProps<'tbody'> & { dense?: boolean }) {
  return (
    <DenseContext.Provider value={dense ?? false}>
      <tbody
        data-slot="table-body"
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    </DenseContext.Provider>
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/70 data-[state=selected]:bg-muted border-b border-border/80 border-dashed transition-colors',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-14 px-4 text-left align-middle font-semibold text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  const dense = React.useContext(DenseContext);
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        dense ? 'py-2' : 'py-3.5',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
