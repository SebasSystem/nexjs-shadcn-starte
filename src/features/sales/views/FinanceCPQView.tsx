'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { formatMoney, getCurrencyPreferences } from 'src/lib/currency';
import { formatDate } from 'src/lib/date';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
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
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { Textarea } from 'src/shared/components/ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  product: string;
  qty: number;
  unitPrice: number;
  discount: number;
  margin: number;
  stock: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_LINES: LineItem[] = [
  {
    id: '1',
    product: 'Licencia Enterprise Anual',
    qty: 2,
    unitPrice: 45000,
    discount: 0,
    margin: 50.0,
    stock: 999,
  },
  {
    id: '2',
    product: 'Módulo CRM Avanzado',
    qty: 1,
    unitPrice: 15000,
    discount: 10,
    margin: 60.0,
    stock: 999,
  },
];

const CLIENT_TYPE_OPTIONS = [
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B', label: 'B2B' },
  { value: 'B2G', label: 'B2G' },
];

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP – Peso colombiano' },
  { value: 'USD', label: 'USD – Dólar estadounidense' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'MXN', label: 'MXN – Peso mexicano' },
];

const PRICE_LIST_OPTIONS = [
  { value: 'standard', label: 'Estándar 2024' },
  { value: 'premium', label: 'Premium' },
  { value: 'gobierno', label: 'Gobierno' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lineTotal(line: LineItem): number {
  return line.qty * line.unitPrice * (1 - line.discount / 100);
}

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<LineItem>();

// ─── Invoice Preview Drawer ───────────────────────────────────────────────────

interface InvoicePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: LineItem[];
}

function InvoicePreviewDrawer({ open, onClose, lines }: InvoicePreviewDrawerProps) {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const today = formatDate(new Date(), { month: 'long' });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[600px] flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border/40">
          <SheetTitle className="text-h6">Factura Generada</SheetTitle>
          <SheetDescription>Vista previa de la factura</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-6 space-y-6">
            {/* Company header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">FinOps CRM</p>
                  <p className="text-xs text-muted-foreground">RFC: FOP230415XYZ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">FAC-2024-0423</p>
                <p className="text-xs text-muted-foreground">{today}</p>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Facturar a
                </p>
                <p className="font-semibold text-foreground">Tecnología Global S.A. de C.V.</p>
                <p className="text-sm text-muted-foreground">B2B</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Detalles
                </p>
                <p className="text-sm text-foreground">
                  Moneda:{' '}
                  <span className="font-medium">{getCurrencyPreferences('tenant').currency}</span>
                </p>
                <p className="text-sm text-foreground">
                  Método: <span className="font-medium">Transferencia</span>
                </p>
              </div>
            </div>

            {/* Products */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Productos
              </p>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/20 border-b border-border/50">
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Cant.
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr
                        key={line.id}
                        className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground">{line.product}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{line.qty}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatMoney(line.unitPrice, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {formatMoney(lineTotal(line), {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatMoney(subtotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-medium text-foreground">
                  {formatMoney(iva, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatMoney(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 pb-6 gap-3">
          <Button variant="outline" className="flex-1">
            Descargar PDF
          </Button>
          <Button color="primary" className="flex-1">
            Enviar al cliente
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function FinanceCPQView() {
  const [lines, setLines] = useState<LineItem[]>(INITIAL_LINES);
  const [client, setClient] = useState('');
  const [clientType, setClientType] = useState('B2B');
  const [currency, setCurrency] = useState(() => getCurrencyPreferences('tenant').currency);
  const [priceList, setPriceList] = useState('standard');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const avgMargin = lines.length > 0 ? lines.reduce((s, l) => s + l.margin, 0) / lines.length : 0;

  const addLine = useCallback(() => {
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        product: '',
        qty: 1,
        unitPrice: 0,
        discount: 0,
        margin: 0,
        stock: 0,
      },
    ]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('product', {
        header: 'Producto',
        cell: (info) => (
          <input
            value={info.getValue()}
            onChange={(e) => updateLine(info.row.original.id, 'product', e.target.value)}
            placeholder="Nombre del producto"
            className="w-full min-w-[160px] bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm text-foreground py-0.5 placeholder:text-muted-foreground/40"
          />
        ),
      }),
      columnHelper.accessor('qty', {
        header: () => <div className="text-center w-full">Cantidad</div>,
        cell: (info) => (
          <div className="flex justify-center">
            <input
              type="number"
              value={info.getValue()}
              onChange={(e) => updateLine(info.row.original.id, 'qty', Number(e.target.value))}
              className="w-16 text-center bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm text-foreground py-0.5"
            />
          </div>
        ),
      }),
      columnHelper.accessor('unitPrice', {
        header: () => <div className="text-right w-full">Precio Unit.</div>,
        cell: (info) => (
          <div className="flex justify-end">
            <input
              type="number"
              value={info.getValue()}
              onChange={(e) =>
                updateLine(info.row.original.id, 'unitPrice', Number(e.target.value))
              }
              className="w-28 text-right bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm text-foreground py-0.5"
            />
          </div>
        ),
      }),
      columnHelper.accessor('discount', {
        header: () => <div className="text-center w-full">Desc. %</div>,
        cell: (info) => (
          <div className="flex justify-center">
            <input
              type="number"
              value={info.getValue()}
              onChange={(e) => updateLine(info.row.original.id, 'discount', Number(e.target.value))}
              className="w-14 text-center bg-transparent border-b border-border/40 focus:border-primary outline-none text-sm text-foreground py-0.5"
            />
          </div>
        ),
      }),
      columnHelper.accessor('margin', {
        header: () => <div className="text-center w-full">Margen</div>,
        cell: (info) => {
          const m = info.getValue();
          const color = m > 30 ? 'success' : m >= 15 ? 'warning' : 'error';
          return (
            <div className="flex justify-center">
              <Badge variant="soft" color={color}>
                {m.toFixed(1)}%
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor('stock', {
        header: () => <div className="text-center w-full">Stock</div>,
        cell: (info) => <div className="text-center text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.display({
        id: 'lineTotal',
        header: () => <div className="text-right w-full">Total Línea</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {formatMoney(lineTotal(info.row.original), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'remove',
        header: () => <div className="text-center w-full">Eliminar</div>,
        cell: (info) => (
          <div className="flex justify-center">
            <button
              onClick={() => removeLine(info.row.original.id)}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ),
      }),
    ],
    [updateLine, removeLine]
  );

  const { table, dense, onChangeDense } = useTable({
    data: lines,
    columns,
    defaultRowsPerPage: 10,
  });

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Cotizador CPQ"
        subtitle="Genera cotizaciones profesionales con control de márgenes"
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header form */}
          <SectionCard className="p-6">
            <h2 className="text-h6 text-foreground mb-4">Datos de la Cotización</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cliente"
                placeholder="Buscar cliente..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
              <SelectField
                label="Tipo cliente"
                options={CLIENT_TYPE_OPTIONS}
                value={clientType}
                onChange={(v) => setClientType(v as string)}
              />
              <SelectField
                label="Moneda"
                options={CURRENCY_OPTIONS}
                value={currency}
                onChange={(v) => setCurrency(v as string)}
              />
              <SelectField
                label="Lista de precios"
                options={PRICE_LIST_OPTIONS}
                value={priceList}
                onChange={(v) => setPriceList(v as string)}
              />
              <Input
                label="Válido hasta"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <Input label="N° Cotización" value="COT-2024-0847" readOnly className="bg-muted/20" />
            </div>
          </SectionCard>

          {/* Products Table — TanStack */}
          <SectionCard noPadding>
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-h6 text-foreground">Productos</h2>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Icon name="Plus" size={15} />
                Agregar producto
              </Button>
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

            <div className="border-t border-border/40">
              <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard className="p-6">
            <Textarea
              label="Notas y condiciones"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ingresa notas o condiciones comerciales para esta cotización..."
            />
          </SectionCard>
        </div>

        {/* ── Sticky Sidebar ───────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
          <SectionCard className="p-5 space-y-3">
            <h3 className="text-h6 text-foreground mb-2">Resumen</h3>

            <div className="space-y-2 pb-3 border-b border-border/40">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatMoney(subtotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-medium text-foreground">
                  {formatMoney(iva, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatMoney(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Margin bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Margen promedio</span>
                <span className="font-bold text-emerald-600">{avgMargin.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(avgMargin, 100)}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <Button variant="outline" className="w-full">
                Guardar borrador
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Aprobar</Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Rechazar
              </Button>
              <Button color="primary" className="w-full" onClick={() => setInvoiceDrawerOpen(true)}>
                Convertir a Factura
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Invoice Preview Drawer */}
      <InvoicePreviewDrawer
        open={invoiceDrawerOpen}
        onClose={() => setInvoiceDrawerOpen(false)}
        lines={lines}
      />
    </PageContainer>
  );
}
