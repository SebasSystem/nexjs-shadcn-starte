'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import type { LowStockProduct } from 'src/features/dashboard/types/dashboard.types';
import { cn } from 'src/lib/utils';
import { SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Badge, Icon } from 'src/shared/components/ui';

const STOCK_STATUS_MAP = {
  critical: { label: 'Crítico', color: 'bg-red-500/10 text-red-600' },
  low: { label: 'Bajo', color: 'bg-amber-500/10 text-amber-600' },
} satisfies Record<LowStockProduct['stock_status'], { label: string; color: string }>;

const columnHelper = createColumnHelper<LowStockProduct>();

const COLUMNS = [
  columnHelper.accessor('name', {
    header: 'Producto',
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('sku', {
    header: 'SKU',
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('current_stock', {
    header: () => <div className="text-right w-full">Actual</div>,
    cell: (info) => (
      <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor('minimum_stock', {
    header: () => <div className="text-right w-full">Mínimo</div>,
    cell: (info) => <div className="text-right font-semibold text-primary">{info.getValue()}</div>,
  }),
  columnHelper.accessor('stock_status', {
    header: () => <div className="text-right w-full">Estado</div>,
    cell: (info) => {
      const { label, color } = STOCK_STATUS_MAP[info.getValue()];
      return (
        <div className="text-right">
          <Badge
            variant="soft"
            className={cn('px-3 py-1 font-semibold rounded-full border-none', color)}
          >
            {label}
          </Badge>
        </div>
      );
    },
  }),
];

interface Props {
  low_stock_products: LowStockProduct[];
}

export function LowStockTable({ low_stock_products }: Props) {
  const { table, dense, onChangeDense } = useTable({
    data: low_stock_products,
    columns: COLUMNS,
    defaultRowsPerPage: 5,
  });

  return (
    <SectionCard noPadding>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Icon name="AlertTriangle" size={15} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-h6 font-semibold text-foreground">Productos con Stock Bajo</h2>
            <p className="text-body2 text-muted-foreground">Requieren atención inmediata</p>
          </div>
        </div>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
          Exportar CSV
        </button>
      </div>

      <TableContainer className="relative">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>
    </SectionCard>
  );
}
