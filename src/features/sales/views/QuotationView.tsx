'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { ProductLine, Quotation } from 'src/features/sales/types/sales.types';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcLineTotal(line: ProductLine): number {
  return line.unitPrice * line.qty * (1 - line.discount / 100);
}

function calcTotals(products: ProductLine[]) {
  const subtotal = products.reduce((s, p) => s + p.unitPrice * p.qty, 0);
  const discount = products.reduce((s, p) => s + p.unitPrice * p.qty * (p.discount / 100), 0);
  const total = subtotal - discount;
  const units = products.reduce((s, p) => s + p.qty, 0);
  return { subtotal, discount, total, units, productCount: products.length };
}

const STATUS_LABELS: Record<Quotation['status'], string> = {
  borrador: 'Borrador',
  enviada: 'Enviada al cliente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  convertida: 'Convertida a Factura',
};

const STATUS_COLORS: Record<Quotation['status'], string> = {
  borrador: 'bg-amber-500/10 text-amber-600',
  enviada: 'bg-blue-500/10 text-blue-600',
  aprobada: 'bg-emerald-500/10 text-emerald-600',
  rechazada: 'bg-red-500/10 text-red-600',
  convertida: 'bg-purple-500/10 text-purple-600',
};

// ─── View ─────────────────────────────────────────────────────────────────────

interface QuotationViewProps {
  quotationId: string;
}

export function QuotationView({ quotationId }: QuotationViewProps) {
  const router = useRouter();
  const {
    opportunities,
    getQuotationById,
    getQuotationByOpportunity,
    saveQuotation,
    convertQuotationToInvoice,
    getInvoiceByQuotation,
  } = useSalesContext();

  // Resolver la cotización: puede ser existente (por id) o nueva (desde opp)
  const isOppId = quotationId.startsWith('opp-');
  const actualOppId = isOppId ? quotationId : undefined;

  const existingById = !isOppId ? getQuotationById(quotationId) : undefined;
  const existingByOpp = actualOppId ? getQuotationByOpportunity(actualOppId) : undefined;
  const existing = existingById ?? existingByOpp;

  const opp = isOppId
    ? opportunities.find((o) => o.id === actualOppId)
    : existing?.opportunityId
      ? opportunities.find((o) => o.id === existing.opportunityId)
      : null;

  const [quotation, setQuotation] = useState<Quotation>(
    () =>
      existing ?? {
        id: `COT-${crypto.randomUUID().split('-')[0]}`,
        opportunityId: actualOppId ?? opp?.id ?? '',
        client: opp?.clientName ?? '',
        priceList: 'B2C - Consumidor Final',
        date: new Date().toISOString().split('T')[0],
        seller: 'Admin Software',
        status: 'borrador',
        products: [],
        internalNotes: '',
      }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // ── Products ───────────────────────────────────────────────────────────────

  const addLine = useCallback(() => {
    setQuotation((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: `line-${crypto.randomUUID().split('-')[0]}`,
          name: '',
          sku: '',
          qty: 1,
          unitPrice: 0,
          discount: 0,
        },
      ],
    }));
  }, []);

  const updateLine = useCallback((id: string, field: keyof ProductLine, rawValue: string) => {
    setQuotation((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== id) return p;
        const numFields: (keyof ProductLine)[] = ['qty', 'unitPrice', 'discount'];
        const value = numFields.includes(field) ? Number(rawValue) : rawValue;
        return { ...p, [field]: value };
      }),
    }));
  }, []);

  const removeLine = useCallback((id: string) => {
    setQuotation((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    saveQuotation(quotation);
    setIsSaving(false);
    toast.success('Cotización guardada como borrador');
  };

  const handleSend = async () => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = { ...quotation, status: 'enviada' as const };
    setQuotation(updated);
    saveQuotation(updated);
    setIsSending(false);
    toast.success('Cotización enviada al cliente');
  };

  const handleReject = () => {
    const updated = { ...quotation, status: 'rechazada' as const };
    setQuotation(updated);
    saveQuotation(updated);
    toast.info('Cotización marcada como rechazada');
  };

  const handleConvert = async () => {
    setIsConverting(true);
    await new Promise((r) => setTimeout(r, 600));
    const invoice = convertQuotationToInvoice(quotation.id);
    saveQuotation({ ...quotation, status: 'convertida' });
    router.push(paths.sales.invoice(invoice.id));
  };

  const invoice = getInvoiceByQuotation(quotation.id);

  const isBorrador = quotation.status === 'borrador';
  const isEnviada = quotation.status === 'enviada' || quotation.status === 'aprobada';
  const isConvertida = quotation.status === 'convertida';
  const isRechazada = quotation.status === 'rechazada';
  const isEditable = isBorrador;

  const totals = calcTotals(quotation.products);

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
            <h1 className="text-h4 text-foreground">{quotation.id}</h1>
            <Badge
              variant="soft"
              className={`px-3 py-1 text-xs font-semibold rounded-full border-none ${
                STATUS_COLORS[quotation.status]
              }`}
            >
              {STATUS_LABELS[quotation.status]}
            </Badge>
          </div>
          <p className="text-body2 text-muted-foreground mt-1">
            Detalle de oportunidad y cotización
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
          <Button
            variant="ghost"
            className="text-muted-foreground mr-1 hover:bg-muted/10 transition-colors"
            onClick={() => router.push(paths.sales.pipeline)}
          >
            Volver
          </Button>

          {/* Borrador: guardar + enviar al cliente */}
          {isBorrador && (
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
                disabled={quotation.products.length === 0}
              >
                <Icon name="Send" size={16} />
                Enviar al cliente
              </Button>
            </>
          )}

          {/* Enviada: ver preview + convertir a factura */}
          {isEnviada && (
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

          {/* Convertida: ver factura */}
          {isConvertida && invoice && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              onClick={() => router.push(paths.sales.invoice(invoice.id))}
            >
              <Icon name="FileText" size={16} />
              Ver Factura
            </Button>
          )}

          {/* Rechazada: solo lectura */}
          {isRechazada && (
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
          {/* Información General */}
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
                  label="Cliente"
                  required
                  value={quotation.client}
                  onChange={(e) => setQuotation((p) => ({ ...p, client: e.target.value }))}
                  placeholder="Seleccionar cliente..."
                  disabled={!isEditable}
                />
                <Input
                  label="Lista de Precios"
                  value={quotation.priceList}
                  onChange={(e) => setQuotation((p) => ({ ...p, priceList: e.target.value }))}
                  placeholder="ej: B2C - Consumidor Final"
                  disabled={!isEditable}
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={quotation.date}
                  onChange={(e) => setQuotation((p) => ({ ...p, date: e.target.value }))}
                  disabled={!isEditable}
                />
                <Input
                  label="Vendedor"
                  value={quotation.seller}
                  onChange={(e) => setQuotation((p) => ({ ...p, seller: e.target.value }))}
                  placeholder="María González"
                  disabled={!isEditable}
                />
              </div>
            </CardContent>
          </Card>

          {/* Líneas de Producto */}
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
                  {quotation.products.length === 0 ? (
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
                    quotation.products.map((line, i) => (
                      <tr
                        key={line.id}
                        className={`group hover:bg-muted/10 transition-colors ${
                          i < quotation.products.length - 1 && 'border-b border-border/40'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            className="w-full bg-transparent border-none outline-none font-medium text-foreground placeholder:text-muted-foreground/50 focus:ring-0"
                            placeholder="Nombre del producto"
                            value={line.name}
                            onChange={(e) => updateLine(line.id, 'name', e.target.value)}
                          />
                          <input
                            className="w-full mt-1 bg-transparent border-none outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/30 focus:ring-0"
                            placeholder="SKU"
                            value={line.sku}
                            onChange={(e) => updateLine(line.id, 'sku', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <input
                              className="w-16 text-center border border-border/50 rounded-lg py-1.5 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                              type="number"
                              min={1}
                              value={line.qty}
                              onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            className="w-full bg-transparent border-none outline-none text-sm text-center font-medium text-foreground focus:ring-0"
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.unitPrice}
                            onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              className="w-12 text-center border border-border/50 rounded-lg py-1.5 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                              type="number"
                              min={0}
                              max={100}
                              value={line.discount}
                              onChange={(e) => updateLine(line.id, 'discount', e.target.value)}
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-foreground">
                          {formatMoney(calcLineTotal(line), {
                            scope: 'tenant',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => removeLine(line.id)}
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

          {/* Oportunidad Timeline (Si hay contexto) */}
          {opp ? <OpportunityTimeline opportunity={opp} /> : null}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="space-y-6">
          {/* Resumen */}
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

          {/* Estadísticas */}
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

          {/* Estado del Lead / Próxima Actividad */}
          {opp ? (
            <Card className="border-none shadow-card py-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="TrendingUp" size={16} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-foreground">Estado del Lead</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">
                      Probabilidad
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${opp.probability || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-9 text-right">
                        {opp.probability || 0}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">
                      Próxima Actividad
                    </span>
                    {opp.nextActivityAt ? (
                      <div className="p-3 bg-indigo-500/10 rounded-lg text-sm border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-medium">
                        {new Date(opp.nextActivityAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground/60 italic">Sin programar</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Notas Internas Ocultado, pues ahora TODO vive en el Timeline Principal */}
        </div>
      </div>
    </PageContainer>
  );
}
