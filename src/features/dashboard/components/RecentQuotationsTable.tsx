'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import type { RecentQuotation } from 'src/features/dashboard/types/dashboard.types';
import { formatMoney } from 'src/lib/currency';
import { formatDate } from 'src/lib/date';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
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
import { Avatar, AvatarFallback, Badge, Icon } from 'src/shared/components/ui';
import { EditButton, ViewButton } from 'src/shared/components/ui/action-buttons';

const QUOTATION_STATUS_MAP = {
  pending: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500',
  },
  approved: {
    label: 'Aprobada',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500',
  },
  rejected: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500',
  },
  review: {
    label: 'En revisión',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
} satisfies Record<RecentQuotation['status'], { label: string; color: string }>;

const columnHelper = createColumnHelper<RecentQuotation>();

const COLUMNS = [
  columnHelper.accessor('number', {
    header: 'N° Cotización',
    cell: (info) => <span className="font-medium text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('account_name', {
    header: 'Cliente',
    cell: (info) => (
      <div className="flex items-center gap-3">
        <Avatar size={32}>
          <AvatarFallback className="text-white text-xs bg-blue-500">
            {info.getValue().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('total', {
    header: 'Monto',
    cell: (info) => (
      <span className="font-bold text-foreground">
        {formatMoney(info.getValue(), { scope: 'tenant', maximumFractionDigits: 0 })}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: (info) => {
      const { label, color } = QUOTATION_STATUS_MAP[info.getValue()];
      return (
        <Badge
          variant="soft"
          className={cn('px-3 py-1 font-semibold rounded-full border-none', color)}
        >
          {label}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('created_at', {
    header: 'Fecha',
    cell: (info) => (
      <span className="text-muted-foreground">
        {formatDate(info.getValue(), { month: 'short' })}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: () => (
      <div className="flex items-center gap-1">
        <ViewButton onClick={() => {}} />
        <EditButton onClick={() => {}} />
      </div>
    ),
  }),
];

interface Props {
  recent_quotations: RecentQuotation[];
}

export function RecentQuotationsTable({ recent_quotations }: Props) {
  const { table, dense, onChangeDense } = useTable({
    data: recent_quotations,
    columns: COLUMNS,
    defaultRowsPerPage: 5,
  });

  return (
    <SectionCard noPadding>
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-foreground">Últimas Cotizaciones</h2>
          <p className="text-sm text-muted-foreground">Cotizaciones creadas recientemente</p>
        </div>
        <Link
          href={paths.sales.finance.quotation}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Ver todas <Icon name="ChevronRight" size={16} />
        </Link>
      </div>

      <TableContainer className="relative">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="py-10 text-center text-muted-foreground text-sm"
                >
                  Sin cotizaciones recientes
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>
    </SectionCard>
  );
}
