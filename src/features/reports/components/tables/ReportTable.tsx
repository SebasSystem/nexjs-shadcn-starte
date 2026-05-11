'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { StockBadge } from 'src/features/inventory/components/StockBadge';
import { cn } from 'src/lib/utils';
import { SectionCard } from 'src/shared/components/layouts/page';
import {
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  useTable,
} from 'src/shared/components/table';
import {
  Badge,
  Icon,
  Input,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'src/shared/components/ui';
import type { IconName } from 'src/shared/components/ui/icon';

const getCellIcon = (id: string): IconName | undefined => {
  const l = id.toLowerCase();
  if (l === 'producto' || l === 'product') return 'Package';
  if (l === 'categoría' || l === 'category' || l === 'categoria') return 'Layers';
  if (l === 'bodega' || l === 'store' || l === 'origen' || l === 'destino') return 'Store';
  if (l.includes('cliente') || l.includes('usuario') || l.includes('user')) return 'User';
  return undefined;
};

interface ReportTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  /** Search term — lifted to parent so the hook can send it server-side.
   *  TODO(backend-pendiente): Backend ReportService no soporta `search`.
   *  El search bar está cableado al hook pero el backend ignora el param.
   *  Cuando se implemente server-side, el filtrado será automático. */
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function ReportTable({ data, columns, search = '', onSearchChange }: ReportTableProps) {
  const tanstackColumns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helper = createColumnHelper<any>();
    return columns.map((col) =>
      helper.accessor(col.id, {
        header: () => {
          return (
            <div className="flex items-center whitespace-nowrap">
              <span>{col.label}</span>
            </div>
          );
        },
        cell: (info) => {
          const row = info.row.original;
          if (col.id === 'Status' || col.id === 'statusBadge') {
            return row.statusBadge ? (
              <Badge variant="soft" color={row.statusBadge.color}>
                {row.statusBadge.label}
              </Badge>
            ) : (
              <StockBadge status={row.stockStatus || 'available'} />
            );
          }
          if (col.id === 'Progress' || col.id === 'pct') {
            return <span className="text-muted-foreground font-medium">{row[col.id]}%</span>;
          }

          const cIcon = getCellIcon(col.id);

          return (
            <div className="flex items-center gap-2">
              {cIcon && (
                <div className="w-6 h-6 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
                  <Icon name={cIcon} size={12} className="text-muted-foreground" />
                </div>
              )}
              <span
                className={cn(
                  'text-foreground',
                  typeof row[col.id] === 'number' ? 'font-mono' : 'truncate max-w-[200px] block'
                )}
              >
                {row[col.id]}
              </span>
            </div>
          );
        },
      })
    );
  }, [columns]);

  const { table, dense, onChangeDense } = useTable({
    data,
    columns: tanstackColumns,
    defaultRowsPerPage: 10,
  });

  // Defensive: guard against non-array table_data from wrapped API responses
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <SectionCard noPadding className="shadow-sm overflow-hidden flex flex-col w-full bg-card">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-muted/5">
        <h2 className="text-h6 text-foreground">Detalle de registros</h2>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            leftIcon={<Icon name="Search" size={16} />}
          />
        </div>
      </div>

      <TableContainer className="w-full">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Icon name="AlertTriangle" size={24} className="mb-2 opacity-50" />
                    <p>No hay resultados que coincidan con la búsqueda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
    </SectionCard>
  );
}
