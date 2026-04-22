'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Calendar, Tag, User, AlertTriangle, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from 'src/lib/utils';
import { Sheet, SheetContent, SheetTitle } from 'src/shared/components/ui/sheet';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { paths } from 'src/routes/paths';
import { useSalesContext } from '../context/SalesContext';
import { STAGE_PROBABILITY, LOST_REASON_LABELS } from '../config/pipeline.config';
import { PIPELINE_STAGES } from 'src/_mock/_sales';
import { DealAvatar } from './DealAvatar';
import { StageProgressBar } from './StageProgressBar';
import { OpportunityChecklist } from './OpportunityChecklist';
import { OpportunityTimeline } from './OpportunityTimeline';
import { OpportunityQuotationsTab } from './OpportunityQuotationsTab';
import type { AgingLevel } from '../hooks/useOpportunityPanel';
import type { Opportunity } from '../types/sales.types';

type TabId = 'resumen' | 'checklist' | 'actividades' | 'cotizaciones' | 'factura';

const TABS: { id: TabId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'actividades', label: 'Actividades' },
  { id: 'cotizaciones', label: 'Cotizaciones' },
  { id: 'factura', label: 'Factura' },
];

const AGING_STYLES: Record<AgingLevel, { label: string; className: string }> = {
  normal: { label: '', className: '' },
  warning: { label: 'd en etapa', className: 'bg-warning/10 text-warning' },
  risk: { label: 'd en etapa', className: 'bg-orange-500/10 text-orange-500' },
  stalled: { label: 'd estancado', className: 'bg-destructive/10 text-destructive' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    const safe = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    return format(new Date(safe), 'd MMM yyyy', { locale: es });
  } catch {
    return dateStr;
  }
}

interface InvoiceTabProps {
  opportunity: Opportunity;
}

function InvoiceTab({ opportunity }: InvoiceTabProps) {
  const router = useRouter();
  const { getInvoiceByQuotation } = useSalesContext();
  const invoice = opportunity.quotationId
    ? getInvoiceByQuotation(opportunity.quotationId)
    : undefined;

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-body2 text-muted-foreground">Sin factura generada</p>
        <p className="text-caption text-muted-foreground/60">
          Convertí una cotización aprobada para generar la factura.
        </p>
      </div>
    );
  }

  const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    pagada: 'success',
    parcial: 'warning',
    pendiente: 'default',
    vencida: 'error',
  };

  const pending = invoice.total - invoice.totalPaid;
  const progress = invoice.total > 0 ? Math.round((invoice.totalPaid / invoice.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-body2 font-bold text-foreground font-mono">{invoice.id}</p>
          <p className="text-caption text-muted-foreground">{formatDate(invoice.issueDate)}</p>
        </div>
        <Badge variant="soft" color={STATUS_COLOR[invoice.status] ?? 'default'}>
          {invoice.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/30 p-3">
          <p className="text-caption text-muted-foreground mb-0.5">Total</p>
          <p className="text-body2 font-bold text-foreground">{formatCurrency(invoice.total)}</p>
        </div>
        <div className="rounded-xl bg-muted/30 p-3">
          <p className="text-caption text-muted-foreground mb-0.5">Pendiente</p>
          <p className="text-body2 font-bold text-destructive">{formatCurrency(pending)}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-caption text-muted-foreground">
          <span>Pagado</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => router.push(paths.sales.invoice(invoice.id))}
      >
        Ver factura completa
      </Button>
    </div>
  );
}

interface ResumenTabProps {
  opportunity: Opportunity;
}

function ResumenTab({ opportunity }: ResumenTabProps) {
  const router = useRouter();
  const isTerminal = opportunity.stage === 'cerrado';
  const isLost = opportunity.stage === 'cerrado' && opportunity.outcome === 'perdido';
  const weightedAmount = opportunity.estimatedAmount * STAGE_PROBABILITY[opportunity.stage];
  const checklistDone = opportunity.checklist.filter((i) => i.done).length;
  const checklistTotal = opportunity.checklist.length;

  return (
    <div className="space-y-5">
      {/* Lost reason info */}
      {isLost && opportunity.lostReason && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-destructive shrink-0" />
            <span className="text-caption font-bold text-destructive uppercase tracking-wide">
              Razón de pérdida
            </span>
          </div>
          <p className="text-body2 font-semibold text-foreground">
            {LOST_REASON_LABELS[opportunity.lostReason.category]}
            {opportunity.lostReason.competitorName && (
              <span className="text-muted-foreground font-normal">
                {' '}
                · {opportunity.lostReason.competitorName}
              </span>
            )}
          </p>
          <p className="text-caption text-muted-foreground">{opportunity.lostReason.detail}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/30 p-3 space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign size={13} />
            <span className="text-caption">Monto estimado</span>
          </div>
          <p className="text-body2 font-bold text-foreground">
            {formatCurrency(opportunity.estimatedAmount)}
          </p>
          {!isTerminal && (
            <p className="text-[10px] text-muted-foreground">
              Ponderado: {formatCurrency(weightedAmount)}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-muted/30 p-3 space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={13} />
            <span className="text-caption">Cierre esperado</span>
          </div>
          <p className="text-body2 font-bold text-foreground">
            {formatDate(opportunity.expectedCloseDate)}
          </p>
        </div>

        {opportunity.probability !== undefined && (
          <div className="rounded-xl bg-muted/30 p-3 space-y-1.5">
            <span className="text-caption text-muted-foreground">Probabilidad</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    opportunity.probability >= 70
                      ? 'bg-success'
                      : opportunity.probability >= 40
                        ? 'bg-warning'
                        : 'bg-destructive'
                  )}
                  style={{ width: `${opportunity.probability}%` }}
                />
              </div>
              <span className="text-caption font-bold text-foreground shrink-0">
                {opportunity.probability}%
              </span>
            </div>
          </div>
        )}

        {checklistTotal > 0 && (
          <div className="rounded-xl bg-muted/30 p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckSquare size={13} />
              <span className="text-caption">Checklist</span>
            </div>
            <p className="text-body2 font-bold text-foreground">
              {checklistDone}/{checklistTotal}
            </p>
            <p className="text-[10px] text-muted-foreground">tareas completadas</p>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="space-y-2">
        {opportunity.source && (
          <div className="flex items-center gap-2 text-body2">
            <Tag size={13} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Origen:</span>
            <span className="text-foreground font-medium">{opportunity.source}</span>
          </div>
        )}
        {opportunity.owner && (
          <div className="flex items-center gap-2 text-body2">
            <User size={13} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Responsable:</span>
            <span className="text-foreground font-medium">{opportunity.owner}</span>
          </div>
        )}
        {opportunity.mainProduct && (
          <div className="flex items-center gap-2 text-body2">
            <span className="text-muted-foreground">Producto:</span>
            <span className="text-foreground font-medium">{opportunity.mainProduct}</span>
          </div>
        )}
      </div>

      {/* Stage-aware CTA */}
      {!isTerminal && (
        <div className="border-t border-border/40 pt-4 flex flex-col gap-2">
          {opportunity.stage === 'leads' && (
            <Button
              color="primary"
              className="w-full"
              onClick={() => router.push(paths.sales.quotation(opportunity.id))}
            >
              Crear cotización
            </Button>
          )}
          {(opportunity.stage === 'contactado' || opportunity.stage === 'negociacion') && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(paths.sales.quotation(opportunity.quotationId || opportunity.id))
              }
            >
              Ver cotización
            </Button>
          )}
        </div>
      )}

      {opportunity.stage === 'cerrado' &&
        opportunity.outcome === 'ganado' &&
        opportunity.quotationId && (
          <div className="border-t border-border/40 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(paths.sales.quotation(opportunity.quotationId!))}
            >
              Ver cotización (cerrada)
            </Button>
          </div>
        )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface OpportunityPanelProps {
  opportunityId: string | null;
  isOpen: boolean;
  onClose: () => void;
  daysInStage: number;
  agingLevel: AgingLevel;
}

export function OpportunityPanel({
  opportunityId,
  isOpen,
  onClose,
  daysInStage,
  agingLevel,
}: OpportunityPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const { opportunities } = useSalesContext();
  const opportunity = opportunityId ? opportunities.find((o) => o.id === opportunityId) : undefined;

  const agingStyle = AGING_STYLES[agingLevel];
  const stageLabel = opportunity
    ? PIPELINE_STAGES.find((s) => s.id === opportunity.stage)?.label
    : undefined;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[680px] flex flex-col p-0">
        <SheetTitle className="sr-only">
          {opportunity ? opportunity.clientName : 'Panel de oportunidad'}
        </SheetTitle>
        {opportunity ? (
          <>
            {/* Header — pr-10 deja espacio para el X nativo del SheetContent */}
            <div className="px-6 pr-10 pt-6 pb-4 border-b border-border/40 space-y-4">
              <div className="flex items-center gap-3 min-w-0">
                <DealAvatar name={opportunity.clientName} size="lg" />
                <div className="min-w-0">
                  <h2 className="text-subtitle1 font-bold text-foreground leading-tight truncate">
                    {opportunity.clientName}
                  </h2>
                  {opportunity.contactName && (
                    <p className="text-caption text-muted-foreground">{opportunity.contactName}</p>
                  )}
                  <p className="text-caption text-muted-foreground/70 mt-0.5">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(opportunity.estimatedAmount)}
                    </span>
                    {stageLabel && <span className="text-muted-foreground"> · {stageLabel}</span>}
                  </p>
                  {agingLevel !== 'normal' && daysInStage > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
                        agingStyle.className
                      )}
                    >
                      <AlertTriangle size={9} />
                      {daysInStage}
                      {agingStyle.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <StageProgressBar currentStage={opportunity.stage} outcome={opportunity.outcome} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 px-6 overflow-x-auto custom-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2',
                    activeTab === tab.id
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {tab.id === 'checklist' && opportunity.checklist.length > 0 && (
                    <span className="ml-1.5 text-[9px] bg-muted rounded-full px-1.5 py-0.5 font-mono">
                      {opportunity.checklist.filter((i) => i.done).length}/
                      {opportunity.checklist.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              {activeTab === 'resumen' && <ResumenTab opportunity={opportunity} />}
              {activeTab === 'checklist' && <OpportunityChecklist opportunity={opportunity} />}
              {activeTab === 'actividades' && <OpportunityTimeline opportunity={opportunity} />}
              {activeTab === 'cotizaciones' && (
                <OpportunityQuotationsTab opportunity={opportunity} />
              )}
              {activeTab === 'factura' && <InvoiceTab opportunity={opportunity} />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-body2">Seleccioná un deal</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
