'use client';

import { Package, Globe, Clock, CheckSquare, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from 'src/lib/utils';
import { STAGE_AGING_THRESHOLDS, STAGE_PROBABILITY } from '../config/pipeline.config';
import { DealAvatar } from './DealAvatar';
import type { AgingLevel } from '../hooks/useOpportunityPanel';
import type { Opportunity } from 'src/features/sales/types/sales.types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  stageColor: string;
  onOpenPanel: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getActivityStatus(lastActivityAt?: string, createdAt?: string) {
  const dateStr = lastActivityAt || createdAt;
  if (!dateStr) return { color: 'bg-slate-400', label: 'Sin datos' };
  const refDate = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
  const diff = differenceInDays(new Date(), refDate);
  if (diff <= 3)
    return { color: 'bg-emerald-500', label: lastActivityAt ? 'Reciente' : 'Nuevo lead' };
  if (diff <= 7) return { color: 'bg-amber-500', label: 'Falta atención' };
  return { color: 'bg-red-500', label: 'Riesgo abandono' };
}

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
    const hasTimeInfo = dateStr.includes('T') || dateStr.includes(' ');
    const safeDateStr = hasTimeInfo ? dateStr : `${dateStr}T12:00:00`;
    return format(new Date(safeDateStr), 'd MMM yyyy', { locale: es });
  } catch {
    return dateStr;
  }
}

function getAgingLevel(opportunity: Opportunity): AgingLevel {
  if (!opportunity.stageEnteredAt) return 'normal';
  const days = differenceInDays(new Date(), new Date(opportunity.stageEnteredAt));
  const t = STAGE_AGING_THRESHOLDS[opportunity.stage];
  if (days >= t.stalled) return 'stalled';
  if (days >= t.risk) return 'risk';
  if (days >= t.warning) return 'warning';
  return 'normal';
}

function getDaysInStage(opportunity: Opportunity): number {
  if (!opportunity.stageEnteredAt) return 0;
  return differenceInDays(new Date(), new Date(opportunity.stageEnteredAt));
}

const AGING_BADGE: Record<AgingLevel, { label: string; className: string } | null> = {
  normal: null,
  warning: { label: 'd', className: 'bg-warning/10 text-warning' },
  risk: { label: 'd', className: 'bg-orange-500/10 text-orange-500' },
  stalled: { label: 'd', className: 'bg-destructive/10 text-destructive' },
};

export function OpportunityCard({ opportunity, stageColor, onOpenPanel }: OpportunityCardProps) {
  const isArchived = opportunity.stage === 'cerrado-perdido';
  const activityIndicator = getActivityStatus(opportunity.lastActivityAt, opportunity.createdAt);
  const agingLevel = getAgingLevel(opportunity);
  const daysInStage = getDaysInStage(opportunity);
  const agingBadge = AGING_BADGE[agingLevel];
  const checklistDone = opportunity.checklist?.filter((i) => i.done).length ?? 0;
  const checklistTotal = opportunity.checklist?.length ?? 0;
  const weightedAmount = opportunity.estimatedAmount * STAGE_PROBABILITY[opportunity.stage];

  return (
    <div
      onClick={() => !isArchived && onOpenPanel(opportunity.id)}
      draggable={!isArchived}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', opportunity.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'group relative bg-card rounded-xl border border-border/50 p-4',
        !isArchived &&
          'cursor-pointer hover:shadow-md hover:border-border transition-all duration-200 hover:-translate-y-0.5',
        isArchived && 'opacity-60 cursor-default'
      )}
    >
      {/* Row 1: Avatar + name + aging badge */}
      <div className="flex items-start gap-2.5 mb-3">
        <DealAvatar name={opportunity.clientName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-subtitle2 text-foreground font-bold leading-snug truncate group-hover:text-primary transition-colors">
            {opportunity.clientName}
          </p>
          {opportunity.contactName && (
            <p className="text-[10px] text-muted-foreground truncate">{opportunity.contactName}</p>
          )}
        </div>
        {agingBadge && daysInStage > 0 && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
              agingBadge.className
            )}
          >
            <AlertTriangle size={8} />
            {daysInStage}
            {agingBadge.label}
          </span>
        )}
      </div>

      {/* Product badge */}
      {opportunity.mainProduct && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 border border-border/50 px-2 py-1 bg-muted/20 rounded-md w-max max-w-full">
          <Package size={12} className="shrink-0" />
          <span className="truncate leading-none">{opportunity.mainProduct}</span>
        </div>
      )}

      {/* Amount + probability */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-extrabold text-foreground" style={{ color: stageColor }}>
            {formatCurrency(opportunity.estimatedAmount)}
          </span>
          {opportunity.stage !== 'cerrado-ganado' && opportunity.stage !== 'cerrado-perdido' && (
            <span className="text-[10px] text-muted-foreground">
              ≈ {formatCurrency(weightedAmount)} ponderado
            </span>
          )}
        </div>

        {opportunity.probability !== undefined && (
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full',
              opportunity.probability >= 70
                ? 'bg-success/10 text-success'
                : opportunity.probability >= 40
                  ? 'bg-warning/10 text-warning'
                  : 'bg-destructive/10 text-destructive'
            )}
          >
            {opportunity.probability}%
          </span>
        )}
      </div>

      {/* Footer: activity + checklist + source */}
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', activityIndicator.color)} />
          <span className="text-[10px] text-muted-foreground font-medium">
            {activityIndicator.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checklistTotal > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckSquare size={10} />
              <span>
                {checklistDone}/{checklistTotal}
              </span>
            </div>
          )}
          {opportunity.source && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">
              <Globe size={9} className="shrink-0" />
              <span>{opportunity.source}</span>
            </div>
          )}
        </div>
      </div>

      {opportunity.nextActivityAt && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock size={9} className="shrink-0" />
          <span>Próx: {formatDate(opportunity.nextActivityAt)}</span>
        </div>
      )}
    </div>
  );
}
