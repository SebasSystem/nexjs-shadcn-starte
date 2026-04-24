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
import type { Quotation } from '../types/sales.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function calcQuotationTotal(q: Quotation): number {
  return q.products.reduce((sum, p) => sum + p.unitPrice * p.qty * (1 - p.discount / 100), 0);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'convertida', label: 'Convertida' },
];

const STATUS_CONFIG: Record<Quotation['status'], { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-amber-500/10 text-amber-600' },
  enviada: { label: 'Enviada', className: 'bg-blue-500/10 text-blue-600' },
  aprobada: { label: 'Aprobada', className: 'bg-emerald-500/10 text-emerald-600' },
  rechazada: { label: 'Rechazada', className: 'bg-red-500/10 text-red-600' },
  convertida: { label: 'Convertida', className: 'bg-purple-500/10 text-purple-600' },
};

// ─── Column helper ────────────────────────────────────────────────────────────

const col = createColumnHelper<Quotation>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function QuotationsListView() {
  const router = useRouter();
  const { quotations, convertQuotationToInvoice, saveQuotation } = useSalesContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(
    () =>
      quotations.filter((q) => {
        const matchesSearch =
          !search ||
          q.client.toLowerCase().includes(search.toLowerCase()) ||
          q.id.toLowerCase().includes(search.toLowerCase()) ||
          q.seller.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || q.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [quotations, search, statusFilter]
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
      col.accessor('seller', {
        header: 'Vendedor',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      col.accessor('priceList', {
        header: 'Lista de Precios',
        cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue()}</span>,
      }),
      col.accessor('date', {
        header: 'Fecha',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      col.display({
        id: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(calcQuotationTotal(row.original))}
          </span>
        ),
      }),
      col.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const config = STATUS_CONFIG[info.getValue()];
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
        cell: ({ row }) => {
          const q = row.original;
          const canConvert = q.status === 'enviada' || q.status === 'aprobada';
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(paths.sales.quotation(q.id));
                }}
                title="Ver detalle"
              >
                <Icon name="Eye" size={15} />
              </Button>
              {canConvert && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const invoice = convertQuotationToInvoice(q.id);
                    saveQuotation({ ...q, status: 'convertida' });
                    router.push(paths.sales.invoice(invoice.id));
                  }}
                  title="Convertir a factura"
                >
                  <Icon name="CheckCircle2" size={15} />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [router, convertQuotationToInvoice, saveQuotation]
  );

  const { table, dense, onChangeDense } = useTable({ data: filtered, columns });

  return (
    <PageContainer>
      <PageHeader
        title="Cotizaciones"
        subtitle={`${filtered.length} cotizacion${filtered.length !== 1 ? 'es' : ''}`}
        action={
          <Button color="primary" onClick={() => router.push(paths.sales.pipeline)}>
            <Icon name="Plus" size={16} />
            Nueva Cotización
          </Button>
        }
      />

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
                          : 'Aún no hay cotizaciones'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => router.push(paths.sales.quotation(row.original.id))}
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
