'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { formatMoney } from 'src/lib/currency';
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

// ─── Types & Mock Data ───────────────────────────────────────────────────────

type InvoiceProduct = {
  name: string;
  subtitle: string;
  qty: number;
  unitPrice: number;
  total: number;
};

const PAYMENT_HISTORY = [
  { id: '1', amount: 15000, date: '20 Ene 2024', ref: 'TRF-789456', done: true },
  { id: '2', amount: 12408, date: '28 Ene 2024', ref: 'CARD-5521', done: true },
  { id: '3', amount: 18272, date: null, ref: null, done: false },
];

const INVOICE_PRODUCTS: InvoiceProduct[] = [
  {
    name: 'Licencia Software ERP',
    subtitle: 'Anual - 50 usuarios',
    qty: 1,
    unitPrice: 25000,
    total: 25000,
  },
  {
    name: 'Soporte Técnico Premium',
    subtitle: 'Mensual - 24/7',
    qty: 12,
    unitPrice: 800,
    total: 9600,
  },
  { name: 'Capacitación Inicial', subtitle: '40 horas', qty: 1, unitPrice: 4400, total: 4400 },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cheque', label: 'Cheque' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<InvoiceProduct>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function FinanceInvoiceDetailView() {
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [paymentDate, setPaymentDate] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');

  const productsSubtotal = INVOICE_PRODUCTS.reduce((s, p) => s + p.total, 0);
  const iva = productsSubtotal * 0.16;
  const productsTotal = productsSubtotal + iva;

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="font-medium text-foreground">{info.getValue()}</p>
            <p className="text-xs text-muted-foreground">{info.row.original.subtitle}</p>
          </div>
        ),
      }),
      columnHelper.accessor('qty', {
        header: () => <div className="text-center w-full">Cantidad</div>,
        cell: (info) => <div className="text-center text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('unitPrice', {
        header: () => <div className="text-right w-full">Precio Unit.</div>,
        cell: (info) => (
          <div className="text-right text-muted-foreground">
            {formatMoney(info.getValue(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
      }),
      columnHelper.accessor('total', {
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
    data: INVOICE_PRODUCTS,
    columns,
    defaultRowsPerPage: 10,
  });

  return (
    <PageContainer className="pb-10">
      {/* ── Invoice Header Card ──────────────────────────────────────────── */}
      <Card className="border-none shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-h4 text-foreground">FAC-2024-0042</h1>
                <Badge variant="soft" color="warning">
                  Parcialmente Pagado
                </Badge>
              </div>
              <p className="text-body1 text-muted-foreground">Tecnología Global S.A. de C.V.</p>
              <p className="text-sm text-muted-foreground mt-1">Emitida: 15 Enero 2024</p>
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
                {formatMoney(45680, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {formatMoney(27408, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">2 pagos registrados</p>
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
                {formatMoney(18272, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">Vence: 15 Feb 2024</p>
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
            <span className="text-sm font-bold text-blue-600">60%</span>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              style={{ width: '60%' }}
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium">
            <span>$0</span>
            <span>
              Pagado: {formatMoney(27408, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span>
              {formatMoney(45680, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {formatMoney(18272, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <Button color="primary" className="w-full mt-2">
              Registrar Pago
            </Button>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card className="border-none shadow-card">
          <CardContent className="p-6">
            <h2 className="text-h6 text-foreground mb-5">Línea de tiempo de pagos</h2>

            <div className="space-y-0">
              {PAYMENT_HISTORY.map((payment, idx) => (
                <div key={payment.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 shrink-0 ${
                        payment.done ? 'bg-emerald-500' : 'bg-muted/40 border-2 border-border/50'
                      }`}
                    />
                    {idx < PAYMENT_HISTORY.length - 1 && (
                      <div className="w-px flex-1 bg-border/40 my-1" />
                    )}
                  </div>
                  <div className="pb-6">
                    {payment.done ? (
                      <>
                        <p className="font-semibold text-foreground">
                          {formatMoney(payment.amount, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                          Ref: {payment.ref}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-muted-foreground">
                          Pendiente:{' '}
                          {formatMoney(payment.amount, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground/60">Sin fecha asignada</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Billed Products Table — TanStack ─────────────────────────────── */}
      <SectionCard noPadding>
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-h6 text-foreground">Productos Facturados</h2>
        </div>

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
                {formatMoney(productsSubtotal, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>IVA (16%):</span>
              <span className="font-medium text-foreground">
                {formatMoney(iva, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-base font-bold text-foreground">Total Factura:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatMoney(productsTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

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
