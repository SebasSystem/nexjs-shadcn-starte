'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import type { LogEntry } from 'src/features/admin/types/admin.types';
import { formatRelative } from 'src/lib/date';
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
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Icon } from 'src/shared/components/ui/icon';

export type TenantErrorRow = {
  tenantId: string;
  nombre: string;
  errores: number;
  tipo: string;
  timestamp: string;
  severity: LogEntry['severity'];
};

function getInitials(nombre: string) {
  return (nombre ?? 'tenant')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const columnHelper = createColumnHelper<TenantErrorRow>();

const COLUMNS = [
  columnHelper.accessor('nombre', {
    header: 'Tenant',
    cell: (info) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
            {getInitials(info.getValue())}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground text-sm">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('errores', {
    header: 'Errores 24h',
    cell: (info) => (
      <span
        className={`font-semibold ${
          info.getValue() > 50
            ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'
            : 'text-foreground'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('tipo', {
    header: 'Último mensaje',
    cell: (info) => (
      <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('timestamp', {
    header: 'Último error',
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{formatRelative(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor('severity', {
    header: 'Severidad',
    cell: (info) => {
      const s = info.getValue();
      return (
        <Badge
          variant="outline"
          className={`${
            s === 'CRITICO'
              ? 'bg-red-100 text-red-700 border-transparent'
              : s === 'ALTO'
                ? 'bg-amber-100 text-amber-700 border-transparent'
                : s === 'MEDIO'
                  ? 'bg-orange-100 text-orange-700 border-transparent'
                  : 'bg-gray-100 text-gray-500 border-transparent'
          }`}
        >
          {s}
        </Badge>
      );
    },
  }),
];

interface TenantErrorsTableProps {
  data: TenantErrorRow[];
  isLoading: boolean;
}

export function TenantErrorsTable({ data, isLoading }: TenantErrorsTableProps) {
  const { table, dense, onChangeDense } = useTable({
    data,
    columns: COLUMNS,
    defaultRowsPerPage: 25,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-5 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-muted/40 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon name="CheckCircle2" className="h-12 w-12 text-emerald-500 mb-3 opacity-80" />
        <p className="text-body2 font-medium text-foreground">Sin errores registrados</p>
        <p className="text-caption text-muted-foreground mt-1">
          No hay logs de error en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div>
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={!dense ? 'py-4 px-6' : 'px-6'}>
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
    </div>
  );
}
