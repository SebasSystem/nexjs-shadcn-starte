'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { Quotation, QuotationItem } from 'src/features/sales/types/sales.types';
import { formatMoney } from 'src/lib/currency';
import { paths } from 'src/routes/paths';
import { PageContainer } from 'src/shared/components/layouts/page';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Card, CardContent } from 'src/shared/components/ui/card';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';

import { OpportunityTimeline } from '../components/OpportunityTimeline';
import { useSalesContext } from '../context/SalesContext';
import { useQuotationById } from '../hooks/useQuotation';
import { STATUS_LABELS } from '../types/sales.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcLineTotal(item: QuotationItem): number {
  return item.list_unit_price * item.quantity * (1 - item.discount_percent / 100);
}

function calcTotals(items: QuotationItem[]) {
  const subtotal = items.reduce((s, p) => s + p.list_unit_price * p.quantity, 0);
  const discount = items.reduce(
    (s, p) => s + p.list_unit_price * p.quantity * (p.discount_percent / 100),
    0
  );
  const total = subtotal - discount;
  const units = items.reduce((s, p) => s + p.quantity, 0);
  return { subtotal, discount, total, units, productCount: items.length };
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-600',
  sent: 'bg-blue-500/10 text-blue-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  cancelled: 'bg-purple-500/10 text-purple-600',
};

// ─── View ─────────────────────────────────────────────────────────────────────

interface QuotationViewProps {
  quotationId: string;
}

export function QuotationView({ quotationId }: QuotationViewProps) {
  const router = useRouter();
  const { saveQuotation, convertQuotationToInvoice, invoices, opportunities } = useSalesContext();
  const { quotation: apiQuotation } = useQuotationById(quotationId);

  // Find linked opportunity for timeline
  const opp =
    opportunities.find((o) => o.uid === quotationId) ??
    (apiQuotation ? opportunities.find((o) => o.uid === apiQuotation.quoteable_uid) : undefined);

  // Load quotation from API or create a local draft — no useEffect needed
  const [localQuotation, setLocalQuotation] = useState<Quotation | null>(() => {
    if (apiQuotation) return apiQuotation;
    // If no API quotation yet, create a local draft
    return {
      uid: `COT-${crypto.randomUUID().split('-')[0]}`,
      quote_number: `COT-${crypto.randomUUID().split('-')[0]}`,
      title: opp?.title ?? '',
      status: 'draft',
      currency: 'USD',
      subtotal: 0,
      discount_total: 0,
      total: 0,
      owner_user_uid: '',
      created_by_user_uid: '',
      items: [],
      quoteable_type: 'opportunity',
      quoteable_uid: quotationId,
      notes: '',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };
  });

  const quotation = localQuotation;

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // ── Items ────────────────────────────────────────────────────────────────────

  const addLine = useCallback(() => {
    setLocalQuotation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            uid: `line-${crypto.randomUUID().split('-')[0]}`,
            description: '',
            sku: '',
            quantity: 1,
            list_unit_price: 0,
            discount_percent: 0,
            net_unit_price: 0,
            line_total: 0,
            discount_total: 0,
          },
        ],
      };
    });
  }, []);

  const updateLine = useCallback((uid: string, field: keyof QuotationItem, rawValue: string) => {
    setLocalQuotation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => {
          if (item.uid !== uid) return item;
          const numFields: (keyof QuotationItem)[] = [
            'quantity',
            'list_unit_price',
            'discount_percent',
          ];
          const value = numFields.includes(field) ? Number(rawValue) : rawValue;
          return { ...item, [field]: value };
        }),
      };
    });
  }, []);

  const removeLine = useCallback((uid: string) => {
    setLocalQuotation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.uid !== uid),
      };
    });
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!quotation) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    saveQuotation(quotation);
    setIsSaving(false);
    toast.success('Cotización guardada como borrador');
  };

  const handleSend = async () => {
    if (!quotation) return;
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = { ...quotation, status: 'sent' as const };
    setLocalQuotation(updated);
    saveQuotation(updated);
    setIsSending(false);
    toast.success('Cotización enviada al cliente');
  };

  const handleReject = () => {
    if (!quotation) return;
    const updated = { ...quotation, status: 'rejected' as const };
    setLocalQuotation(updated);
    saveQuotation(updated);
    toast.info('Cotización marcada como rechazada');
  };

  const handleConvert = async () => {
    if (!quotation) return;
    setIsConverting(true);
    await new Promise((r) => setTimeout(r, 600));
    const invoice = await convertQuotationToInvoice(quotation.uid);
    saveQuotation({ ...quotation, status: 'cancelled' });
    if (invoice) {
      router.push(paths.sales.invoice(invoice.uid));
    }
  };

  // Find linked invoice from context's invoices array
  const invoice = quotation
    ? invoices.find((inv) => inv.quotation_uid === quotation.uid)
    : undefined;

  // ── Loading guard ────────────────────────────────────────────────────────────
  if (!quotation) {
    return (
      <PageContainer fluid className="pb-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando cotización…</p>
        </div>
      </PageContainer>
    );
  }

  const isDraft = quotation.status === 'draft';
  const isSent = quotation.status === 'sent' || quotation.status === 'approved';
  const isCancelled = quotation.status === 'cancelled';
  const isRejected = quotation.status === 'rejected';
  const isEditable = isDraft;

  const totals = calcTotals(quotation.items);

  return (
    <PageContainer fluid className="pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push(paths.sales.pipeline)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <Icon name="ArrowLeft" size={15} />
            Volver al Pipeline
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-h4 text-foreground">{quotation.quote_number}</h1>
            <Badge
              variant="soft"
              className={`px-3 py-1 text-xs font-semibold rounded-full border-none ${
                STATUS_COLORS[quotation.status] ?? ''
              }`}
            >
              {STATUS_LABELS[quotation.status] ?? quotation.status}
            </Badge>
          </div>
          <p className="text-body2 text-muted-foreground mt-1">{quotation.title}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
          <Button
            variant="ghost"
            className="text-muted-foreground mr-1 hover:bg-muted/10 transition-colors"
            onClick={() => router.push(paths.sales.pipeline)}
          >
            Volver
          </Button>

          {/* Draft: save + send */}
          {isDraft && (
            <>
              <Button variant="outline" onClick={handleSave} loading={isSaving}>
                <Icon name="Save" size={16} />
                Guardar borrador
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-500/10"
                onClick={handleReject}
              >
                <Icon name="XCircle" size={16} />
                Rechazar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleSend}
                loading={isSending}
                disabled={quotation.items.length === 0}
              >
                <Icon name="Send" size={16} />
                Enviar al cliente
              </Button>
            </>
          )}

          {/* Sent/Approved: preview + convert to invoice */}
          {isSent && (
            <>
              <Button
                variant="outline"
                onClick={() => toast.info('Vista previa de cotización próximamente...')}
              >
                <Icon name="Eye" size={16} />
                Ver cotización
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-500/10"
                onClick={handleReject}
              >
                <Icon name="XCircle" size={16} />
                Rechazar
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleConvert}
                loading={isConverting}
              >
                <Icon name="CheckCircle2" size={16} />
                Convertir a Factura
              </Button>
            </>
          )}

          {/* Cancelled: view invoice */}
          {isCancelled && invoice && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              onClick={() => router.push(paths.sales.invoice(invoice.uid))}
            >
              <Icon name="FileText" size={16} />
              Ver Factura
            </Button>
          )}

          {/* Rejected: read only */}
          {isRejected && (
            <span className="text-sm text-muted-foreground italic px-2">
              Esta cotización fue rechazada
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* LEFT — Main content */}
        <div className="space-y-6">
          {/* General Info */}
          <Card className="border-none shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 flex items-center justify-center rounded-full text-indigo-500 border border-indigo-500/20 bg-indigo-500/10 shrink-0">
                  <Icon name="Info" size={12} strokeWidth={3} />
                </div>
                <h2 className="text-sm font-bold text-foreground">Información General</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Input
                  label="Título"
                  value={quotation.title}
                  onChange={(e) =>
                    setLocalQuotation((p) => ({ ...p, title: e.target.value }) as Quotation)
                  }
                  placeholder="Título de la cotización"
                  disabled={!isEditable}
                />
                <Input
                  label="Moneda"
                  value={quotation.currency}
                  onChange={(e) =>
                    setLocalQuotation((p) => ({ ...p, currency: e.target.value }) as Quotation)
                  }
                  placeholder="USD"
                  disabled={!isEditable}
                />
                <Input
                  label="Fecha de creación"
                  type="date"
                  value={quotation.created_at}
                  onChange={(e) =>
                    setLocalQuotation((p) => ({ ...p, created_at: e.target.value }) as Quotation)
                  }
                  disabled={!isEditable}
                />
                <Input
                  label="Válido hasta"
                  type="date"
                  value={quotation.valid_until ?? ''}
                  onChange={(e) =>
                    setLocalQuotation((p) => ({ ...p, valid_until: e.target.value }) as Quotation)
                  }
                  disabled={!isEditable}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-none shadow-card overflow-hidden py-0 gap-0">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Icon name="Box" size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-foreground">Líneas de Producto</h2>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Agregar Línea
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/10">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Producto
                    </th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24">
                      Cantidad
                    </th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-32">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24">
                      Desc. %
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-32">
                      Total Línea
                    </th>
                    <th className="px-4 py-4 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Icon name="FileText" size={28} className="opacity-30" />
                          <span className="text-sm font-medium">
                            Sin líneas de producto. Agrega una para comenzar.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    quotation.items.map((item, i) => (
                      <tr
                        key={item.uid}
                        className={`group hover:bg-muted/10 transition-colors ${
                          i < quotation.items.length - 1 && 'border-b border-border/40'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            className="w-full bg-transparent border-none outline-none font-medium text-foreground placeholder:text-muted-foreground/50 focus:ring-0"
                            placeholder="Descripción del producto"
                            value={item.description}
                            onChange={(e) => updateLine(item.uid, 'description', e.target.value)}
                          />
                          <input
                            className="w-full mt-1 bg-transparent border-none outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/30 focus:ring-0"
                            placeholder="SKU"
                            value={item.sku ?? ''}
                            onChange={(e) => updateLine(item.uid, 'sku', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <input
                              className="w-16 text-center border border-border/50 rounded-lg py-1.5 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateLine(item.uid, 'quantity', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            className="w-full bg-transparent border-none outline-none text-sm text-center font-medium text-foreground focus:ring-0"
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.list_unit_price}
                            onChange={(e) =>
                              updateLine(item.uid, 'list_unit_price', e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              className="w-12 text-center border border-border/50 rounded-lg py-1.5 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                              type="number"
                              min={0}
                              max={100}
                              value={item.discount_percent}
                              onChange={(e) =>
                                updateLine(item.uid, 'discount_percent', e.target.value)
                              }
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-foreground">
                          {formatMoney(calcLineTotal(item), {
                            scope: 'tenant',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => removeLine(item.uid)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card className="border-none shadow-card">
              <CardContent className="p-6">
                <h2 className="text-sm font-bold text-foreground mb-2">Notas internas</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quotation.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Opportunity Timeline */}
          {opp ? <OpportunityTimeline opportunity={opp} /> : null}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-none shadow-card py-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Icon name="Receipt" size={16} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-foreground">Resumen</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(totals.subtotal, {
                      scope: 'tenant',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Descuento Total</span>
                  <span className="font-semibold text-emerald-500">
                    -
                    {formatMoney(totals.discount, {
                      scope: 'tenant',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="border-t border-border/40 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Final</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatMoney(totals.total, {
                      scope: 'tenant',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-none shadow-card bg-indigo-500 text-white dark:bg-indigo-600 gap-0 py-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon name="TrendingUp" size={20} className="text-white" />
                </div>
                <h2 className="text-sm font-semibold tracking-wide">Estadísticas</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold mb-1">{totals.productCount}</p>
                  <p className="text-xs text-indigo-100">Productos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold mb-1">{totals.units}</p>
                  <p className="text-xs text-indigo-100">Unidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
