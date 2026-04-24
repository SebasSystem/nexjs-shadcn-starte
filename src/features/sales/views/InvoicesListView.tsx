'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  useTable,
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { paths } from 'src/routes/paths';
import { useSalesContext } from '../context/SalesContext';
import type { Invoice } from '../types/sales.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function isOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'pagada') return false;
  return new Date(invoice.dueDate) < new Date();
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'parcial', label: 'Pago parcial' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'vencida', label: 'Vencida' },
];

type DisplayStatus = Invoice['status'] | 'vencida';

const STATUS_CONFIG: Record<DisplayStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-600' },
  parcial: { label: 'Pago Parcial', className: 'bg-blue-500/10 text-blue-600' },
  pagada: { label: 'Pagada', className: 'bg-emerald-500/10 text-emerald-600' },
  vencida: { label: 'Vencida', className: 'bg-red-500/10 text-red-600' },
};

function getEffectiveStatus(invoice: Invoice): DisplayStatus {
  return isOverdue(invoice) ? 'vencida' : invoice.status;
}

// ─── Column helper ────────────────────────────────────────────────────────────

const col = createColumnHelper<Invoice>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function InvoicesListView() {
  const router = useRouter();
  const { invoices } = useSalesContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchesSearch =
          !search ||
          inv.client.toLowerCase().includes(search.toLowerCase()) ||
          inv.id.toLowerCase().includes(search.toLowerCase()) ||
          inv.seller.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || getEffectiveStatus(inv) === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [invoices, search, statusFilter]
  );

  const overdueCount = useMemo(() => invoices.filter(isOverdue).length, [invoices]);
  const pendingBalance = useMemo(
    () =>
      invoices
        .filter((i) => i.status !== 'pagada')
        .reduce((s, i) => s + Math.max(0, i.total - i.totalPaid), 0),
    [invoices]
  );

  const columns = useMemo(
    () => [
      col.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      col.accessor('client', {
        header: 'Cliente',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      col.accessor('issueDate', {
        header: 'Emisión',
        cell: (info) => (
          <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      col.accessor('dueDate', {
        header: 'Vencimiento',
        cell: ({ row }) => {
          const overdue = isOverdue(row.original);
          return (
            <span className={overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
              {formatDate(row.original.dueDate)}
              {overdue && <Icon name="AlertTriangle" size={12} className="inline ml-1" />}
            </span>
          );
        },
      }),
      col.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-semibold text-foreground">{formatCurrency(info.getValue())}</span>
        ),
      }),
      col.accessor('totalPaid', {
        header: 'Pagado',
        cell: (info) => (
          <span className="text-emerald-600 font-medium">{formatCurrency(info.getValue())}</span>
        ),
      }),
      col.display({
        id: 'balance',
        header: 'Saldo',
        cell: ({ row }) => {
          const balance = Math.max(0, row.original.total - row.original.totalPaid);
          return (
            <span
              className={balance > 0 ? 'text-orange-500 font-semibold' : 'text-muted-foreground'}
            >
              {formatCurrency(balance)}
            </span>
          );
        },
      }),
      col.display({
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const config = STATUS_CONFIG[getEffectiveStatus(row.original)];
          return (
            <Badge
              variant="soft"
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border-none ${config.className}`}
            >
              {config.label}
            </Badge>
          );
        },
      }),
      col.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              router.push(paths.sales.invoice(row.original.id));
            }}
            title="Ver detalle"
          >
            <Icon name="Eye" size={15} />
          </Button>
        ),
      }),
    ],
    [router]
  );

  const { table, dense, onChangeDense } = useTable({ data: filtered, columns });

  return (
    <PageContainer>
      <PageHeader
        title="Facturas"
        subtitle={`${filtered.length} factura${filtered.length !== 1 ? 's' : ''}`}
        action={
          <Button color="primary" onClick={() => router.push(paths.sales.pipeline)}>
            <Icon name="Plus" size={16} />
            Nueva Factura
          </Button>
        }
      />

      {/* Alerta de mora */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
          <Icon name="AlertTriangle" size={18} className="text-red-500 shrink-0" />
          <span className="font-medium text-red-700 dark:text-red-400">
            {overdueCount} factura{overdueCount !== 1 ? 's' : ''} vencida
            {overdueCount !== 1 ? 's' : ''} — saldo en mora:{' '}
            <strong>{formatCurrency(pendingBalance)}</strong>
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Buscar por cliente, ID o vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <SelectField
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as string)}
          options={STATUS_OPTIONS}
          className="sm:w-52"
        />
      </div>

      {/* Tabla */}
      <SectionCard noPadding>
        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Icon name="FileText" size={32} className="opacity-30" />
                      <span className="text-sm">
                        {search || statusFilter
                          ? 'Sin resultados para los filtros aplicados'
                          : 'Aún no hay facturas'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => router.push(paths.sales.invoice(row.original.id))}
                  >
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
    </PageContainer>
  );
}
