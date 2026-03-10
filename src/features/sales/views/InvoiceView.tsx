'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Bell,
  CheckCircle2,
  ChevronRight,
  Box,
  Clock,
  Landmark,
  User,
  CalendarDays,
  Receipt,
} from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Card, CardContent } from 'src/shared/components/ui/card';
import { Badge } from 'src/shared/components/ui/badge';
import { SectionCard, PageContainer } from 'src/shared/components/layouts/page';
import { RegisterPaymentDrawer } from '../components/RegisterPaymentDrawer';
import { useInvoice } from '../hooks/useInvoice';
import { paths } from 'src/routes/paths';
import type { Payment } from 'src/types/sales';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

const STATUS_CONFIG = {
  pendiente: {
    label: 'PENDIENTE',
    className: 'bg-amber-500/10 text-amber-600',
  },
  parcial: {
    label: 'PARCIAL',
    className: 'bg-blue-500/10 text-blue-600',
  },
  pagada: {
    label: 'PAGADA',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
} as const;

const METHOD_ICONS: Record<string, string> = {
  'Transferencia Bancaria': '🏦',
  'Tarjeta de Crédito': '💳',
  'Tarjeta de Débito': '💳',
  Efectivo: '💵',
  Cheque: '📄',
};

// ─── View ─────────────────────────────────────────────────────────────────────

interface InvoiceViewProps {
  invoiceId: string;
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const router = useRouter();
  const { invoice, registerPayment } = useInvoice(invoiceId);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);

  if (!invoice) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <FileText size={40} className="opacity-30" />
          <p className="text-lg font-medium">Factura no encontrada</p>
          <Button variant="outline" onClick={() => router.push(paths.sales.pipeline)}>
            Volver al Pipeline
          </Button>
        </div>
      </PageContainer>
    );
  }

  const pendingBalance = Math.max(0, invoice.total - invoice.totalPaid);
  const paymentPercent = Math.min(100, Math.round((invoice.totalPaid / invoice.total) * 100));
  const isPaid = invoice.status === 'pagada';
  const statusConfig = STATUS_CONFIG[invoice.status];

  const handleRegisterPayment = (payment: Omit<Payment, 'id' | 'status'>) => {
    registerPayment(invoiceId, payment);
  };

  // Table totals
  const baseImponible = invoice.products.reduce((s, p) => s + p.subtotal, 0);
  const totalIva = invoice.products.reduce((s, p) => s + p.subtotal * (p.tax / 100), 0);

  return (
    <PageContainer fluid className="pb-10">
      {/* ── Paid banner ────────────────────────────────────────────────── */}
      {isPaid && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Factura completamente pagada
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
              El pago se ha registrado correctamente.
            </p>
          </div>
        </div>
      )}

      {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => router.push(paths.sales.pipeline)}
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} className="mr-0.5" />
          Inicio
        </button>
        <ChevronRight size={14} />
        <span>Facturación</span>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{invoice.id}</span>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] lg:items-start gap-6">
        {/* LEFT */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* ── Header Card ─────────────────────────────────────────────────── */}
          <Card className="p-6 pb-6 shadow-sm overflow-hidden text-sm border-none shadow-card">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 flex items-center justify-center rounded-xl shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h1 className="text-h4 text-foreground leading-tight tracking-tight mb-0.5">
                    {invoice.id}
                  </h1>
                  <p className="text-muted-foreground text-sm">Factura de venta</p>
                </div>
              </div>
              <Badge
                variant="soft"
                className={`px-3 py-1.5 text-xs font-bold rounded-full border-none tracking-wider ${statusConfig.className}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-current mr-1.5 ${
                    invoice.status === 'pendiente'
                      ? 'animate-[pulse_1.5s_ease-in-out_infinite]'
                      : ''
                  }`}
                />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="h-px bg-border/50 my-6" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Cliente
                </span>
                <span className="font-semibold text-foreground text-sm">{invoice.client}</span>
                <span className="text-xs text-muted-foreground">NIF: {invoice.clientNif}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Fecha de Emisión
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {formatDate(invoice.issueDate)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Vencimiento: {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Forma de Pago
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {invoice.paymentMethod}
                </span>
                <span className="text-xs text-muted-foreground">30 días</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Comercial
                </span>
                <span className="font-semibold text-foreground text-sm">{invoice.seller}</span>
                <span className="text-xs text-muted-foreground">Zona Norte</span>
              </div>
            </div>
          </Card>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-none shadow-card gap-0 py-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Total Factura
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
                    <Receipt size={18} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Base imponible: {formatCurrency(baseImponible)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-card gap-0 py-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Total Pagado
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(invoice.totalPaid)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Último pago:{' '}
                  {invoice.payments.length > 0
                    ? formatDate(invoice.payments[invoice.payments.length - 1].date)
                    : '-'}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`border-none shadow-card gap-0 py-0 ${
                pendingBalance > 0 ? 'bg-orange-50/50 dark:bg-orange-500/10' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        pendingBalance > 0 ? 'text-orange-600/70' : 'text-muted-foreground'
                      }`}
                    >
                      Saldo Pendiente
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        pendingBalance > 0 ? 'text-orange-600' : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(pendingBalance)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/10 text-orange-600 shrink-0">
                    <Clock size={18} />
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    pendingBalance > 0 ? 'text-orange-600/70' : 'text-muted-foreground'
                  }`}
                >
                  {pendingBalance > 0 ? 'Vence en 25 días' : 'Sin saldo pendiente'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barra de progreso de pago */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <div className="flex justify-between items-center text-sm font-semibold text-foreground mb-3">
              <span className="flex items-center gap-2">
                <Landmark size={16} className="text-muted-foreground" />
                Progreso de pago
              </span>
              <span>{paymentPercent}%</span>
            </div>
            <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${paymentPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
              <span>Pagado: {formatCurrency(invoice.totalPaid)}</span>
              <span>Total: {formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {/* Tabla de productos */}
          <SectionCard noPadding className="border-none shadow-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Box size={20} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Productos Facturados</h2>
              </div>
              <Badge variant="soft" className="bg-muted text-muted-foreground rounded-full px-3">
                {invoice.products.length} líneas
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    {[
                      'Código',
                      'Descripción',
                      'Cant.',
                      'Precio Unit.',
                      'Dto.',
                      'IVA',
                      'Importe',
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest ${
                          i > 1 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((p, i) => (
                    <tr
                      key={p.code}
                      className={i < invoice.products.length - 1 ? 'border-b border-border/40' : ''}
                    >
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono whitespace-nowrap bg-muted/20 text-muted-foreground border-border/50"
                        >
                          {p.code}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground break-words max-w-[200px] truncate">
                          Detalle en el contrato referencial
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{p.qty}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {formatCurrency(p.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{p.discount}%</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {p.tax}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {formatCurrency(p.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-6 border-t border-border/40 bg-muted/10">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between text-sm py-1.5 text-muted-foreground">
                  <span>Base Imponible:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(baseImponible)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-1.5 text-muted-foreground">
                  <span>IVA (21%):</span>
                  <span className="font-medium text-foreground">{formatCurrency(totalIva)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                  <span className="text-base font-bold text-foreground">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Historial de pagos — Solo si hay pagos */}
          {invoice.payments.length > 0 && (
            <Card className="border-none shadow-card overflow-hidden">
              <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Historial de Pagos</h2>
                <Badge variant="soft" className="bg-emerald-500/10 text-emerald-600 rounded-full">
                  {invoice.payments.length} transacciones
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Método
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Monto
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Referencia
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment, i) => (
                      <tr
                        key={payment.id}
                        className={`hover:bg-muted/10 transition-colors ${i < invoice.payments.length - 1 ? 'border-b border-border/40' : ''}`}
                      >
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{METHOD_ICONS[payment.method] ?? '💰'}</span>
                            <span className="font-medium text-foreground">{payment.method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                          {payment.reference || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="space-y-6">
          {/* Boton Principal */}
          {!isPaid && (
            <Button
              color="primary"
              className="w-full text-base py-6 shadow-md shadow-blue-500/20"
              onClick={() => setPaymentDrawerOpen(true)}
            >
              <CheckCircle2 size={18} className="mr-2" /> Registrar Pago
            </Button>
          )}

          {/* Acciones */}
          <Card className="border-none shadow-card">
            <CardContent className="p-6">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Alertas y Recordatorios
              </h3>
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <Bell size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-400 block mb-1">
                      Próximo Recordatorio
                    </span>
                    <span className="text-sm font-semibold text-foreground mb-2 block">
                      {invoice.paymentReminderDate
                        ? formatDate(invoice.paymentReminderDate)
                        : '24 de Marzo de 2026'}
                    </span>
                    <span className="text-xs text-orange-600/80 leading-relaxed block">
                      Aviso automático programado para enviarse al cliente indicando el pago
                      pendiente.
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Acciones
              </h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <Download size={15} />
                  </div>
                  Descargar PDF
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <FileText size={15} />
                  </div>
                  Exportar CSV
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Mail size={15} />
                  </div>
                  Enviar por Email
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <CalendarDays size={15} />
                  </div>
                  Programar Recordatorio
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Card cliente Dark */}
          <Card className="border-none shadow-card bg-slate-900 text-slate-100 dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Cliente
                  </p>
                  <p className="font-semibold leading-tight">{invoice.client}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Facturas activas:</span>
                  <span className="font-medium text-white">1</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Deuda total:</span>
                  <span className="font-medium text-orange-400">
                    {formatCurrency(pendingBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Cliente desde:</span>
                  <span className="font-medium text-white">Ene 2024</span>
                </div>
              </div>

              <div className="text-center w-full">
                <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5">
                  Ver ficha completa <ChevronRight size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Payment Drawer ─────────────────────────────────────────────── */}
      <RegisterPaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        pendingBalance={pendingBalance}
        onConfirm={handleRegisterPayment}
      />
    </PageContainer>
  );
}
