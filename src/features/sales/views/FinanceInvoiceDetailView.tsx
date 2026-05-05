'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { formatMoney } from 'src/lib/currency';
import { formatDate } from 'src/lib/date';
import { PageContainer, SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Card, CardContent } from 'src/shared/components/ui/card';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

import { useInvoice } from '../hooks/useInvoice';
import type { Invoice, Payment, QuotationItem } from '../types/sales.types';
import { STATUS_LABELS } from '../types/sales.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadgeColor(status: Invoice['status']): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial':
    case 'issued':
      return 'warning';
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
}

// ─── Column helper ────────────────────────────────────────────────────────────

type InvoiceProductRow = QuotationItem;

const columnHelper = createColumnHelper<InvoiceProductRow>();

// ─── Empty placeholder ────────────────────────────────────────────────────────

const EMPTY_INVOICE: Invoice = {
  uid: '',
  invoice_number: '',
  quotation_uid: '',
  issued_at: '',
  due_date: '',
  status: 'draft',
  total: 0,
  paid_total: 0,
  outstanding_total: 0,
  subtotal: 0,
  discount_total: 0,
  currency: 'USD',
  meta: {},
  invoiceable_type: '',
  invoiceable_uid: '',
  created_at: '',
  updated_at: '',
};

// ─── View ─────────────────────────────────────────────────────────────────────

interface FinanceInvoiceDetailViewProps {
  invoiceUid: string;
}

export function FinanceInvoiceDetailView({ invoiceUid }: FinanceInvoiceDetailViewProps) {
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [paymentDate, setPaymentDate] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');

  const { invoice: rawInvoice, payments = [], isLoading, registerPayment } = useInvoice(invoiceUid);

  const invoice = rawInvoice ?? EMPTY_INVOICE;

  const PAYMENT_METHOD_OPTIONS = [
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'cheque', label: 'Cheque' },
  ];

  // ─── Derived values ────────────────────────────────────────────────────

  const products: InvoiceProductRow[] = useMemo(() => {
    // Items come from the quotation associated to this invoice
    // For now, derive from invoice totals; items would come from a separate endpoint
    return [];
  }, []);

  const progressPercent =
    invoice.total > 0 ? Math.round((invoice.paid_total / invoice.total) * 100) : 0;

  const handleRegisterPayment = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return;
    await registerPayment({
      amount: numericAmount,
      method: paymentMethod,
      payment_date: paymentDate || new Date().toISOString().split('T')[0],
      external_reference: reference || undefined,
      invoice_uid: invoiceUid,
    });
    setAmount('');
    setReference('');
  };

  // ─── Products table ────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      columnHelper.accessor('description', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="font-medium text-foreground">{info.getValue()}</p>
          </div>
        ),
      }),
      columnHelper.accessor('quantity', {
        header: () => <div className="text-center w-full">Cantidad</div>,
        cell: (info) => <div className="text-center text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('list_unit_price', {
        header: () => <div className="text-right w-full">Precio Unit.</div>,
        cell: (info) => (
          <div className="text-right text-muted-foreground">
            {formatMoney(info.getValue(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
      }),
      columnHelper.accessor('line_total', {
        header: () => <div className="text-right w-full">Total</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {formatMoney(info.getValue(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: products,
    columns,
    defaultRowsPerPage: 10,
  });

  if (isLoading) {
    return (
      <PageContainer className="pb-10">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Cargando factura...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-10">
      {/* ── Invoice Header Card ──────────────────────────────────────────── */}
      <Card className="border-none shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-h4 text-foreground">{invoice.invoice_number}</h1>
                <Badge variant="soft" color={statusBadgeColor(invoice.status)}>
                  {STATUS_LABELS[invoice.status] ?? invoice.status}
                </Badge>
              </div>
              <p className="text-body1 text-muted-foreground">
                {invoice.currency} · Emitida: {formatDate(invoice.issued_at)}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-muted-foreground mt-1">
                  Vence: {formatDate(invoice.due_date)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="py-0 gap-0 border-none shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Factura
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(invoice.total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">IVA incluido</p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
              <Icon name="FileText" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 gap-0 border-none shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Monto Pagado
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(invoice.paid_total, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {payments.length} {payments.length === 1 ? 'pago registrado' : 'pagos registrados'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <Icon name="CheckCircle2" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 gap-0 border-none shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Saldo Pendiente
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatMoney(invoice.outstanding_total, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {invoice.due_date && (
                <p className="text-xs text-muted-foreground">
                  Vence: {formatDate(invoice.due_date)}
                </p>
              )}
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500">
              <Icon name="Clock" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Payment Progress Bar ─────────────────────────────────────────── */}
      <Card className="border-none shadow-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Progreso de pago</span>
            <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium">
            <span>$0</span>
            <span>
              Pagado:{' '}
              {formatMoney(invoice.paid_total, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span>
              {formatMoney(invoice.total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Register Payment + Timeline ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Register Payment Form */}
        <Card className="border-none shadow-card">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-h6 text-foreground mb-2">Registrar Pago</h2>

            <SelectField
              label="Método de pago"
              options={PAYMENT_METHOD_OPTIONS}
              value={paymentMethod}
              onChange={(v) => setPaymentMethod(v as string)}
            />

            <Input
              label="Fecha de pago"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <Input
              label="Referencia"
              placeholder="Ej. TRF-001234"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />

            <div>
              <Input
                label="Monto del pago"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Saldo pendiente:{' '}
                {formatMoney(invoice.outstanding_total, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <Button color="primary" className="w-full mt-2" onClick={handleRegisterPayment}>
              Registrar Pago
            </Button>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card className="border-none shadow-card">
          <CardContent className="p-6">
            <h2 className="text-h6 text-foreground mb-5">Línea de tiempo de pagos</h2>

            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay pagos registrados aún.</p>
            ) : (
              <div className="space-y-0">
                {payments.map((payment: Payment, idx: number) => (
                  <div key={payment.uid} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full mt-0.5 shrink-0 bg-emerald-500" />
                      {idx < payments.length - 1 && (
                        <div className="w-px flex-1 bg-border/40 my-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold text-foreground">
                        {formatMoney(payment.amount, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_date ? formatDate(payment.payment_date) : 'Sin fecha'}
                      </p>
                      {payment.external_reference && (
                        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                          Ref: {payment.external_reference}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-0.5 capitalize">
                        {payment.method}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Billed Products Table — TanStack ─────────────────────────────── */}
      <SectionCard noPadding>
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-h6 text-foreground">Productos Facturados</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Los productos facturados se cargan desde la cotización asociada.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeadCustom table={table} />
                <TableBody dense={dense}>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals footer */}
            <div className="flex justify-end p-6 border-t border-border/40 bg-muted/10">
              <div className="w-full max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(invoice.subtotal, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Descuento:</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(invoice.discount_total, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <span className="text-base font-bold text-foreground">Total Factura:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatMoney(invoice.total, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      {/* ── Footer Actions ───────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Icon name="Download" size={16} />
          Descargar PDF
        </Button>
        <Button color="primary">
          <Icon name="Mail" size={16} />
          Enviar por Correo
        </Button>
      </div>
    </PageContainer>
  );
}
