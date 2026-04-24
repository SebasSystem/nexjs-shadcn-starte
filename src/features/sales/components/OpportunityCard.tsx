'use client';

import { Package, AlertTriangle, Check, Flame, Trophy, XCircle, CheckSquare } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from 'src/lib/utils';
import { STAGE_AGING_THRESHOLDS, STAGE_PROBABILITY } from '../config/pipeline.config';
import { DealAvatar } from './DealAvatar';
import { LinkedInValidationBadge } from 'src/features/automation/components/LinkedInValidationBadge';
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
  if (diff <= 3) return { color: 'bg-emerald-500', label: lastActivityAt ? 'Reciente' : 'Nuevo' };
  if (diff <= 7) return { color: 'bg-amber-500', label: 'Falta atención' };
  return { color: 'bg-red-500', label: 'En riesgo' };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

const AGING_BADGE: Record<AgingLevel, { className: string } | null> = {
  normal: null,
  warning: { className: 'bg-warning/10 text-warning' },
  risk: { className: 'bg-orange-500/10 text-orange-500' },
  stalled: { className: 'bg-destructive/10 text-destructive' },
};

const LEAD_SCORE_CONFIG = {
  hot: {
    label: 'Caliente',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  warm: {
    label: 'Tibio',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  cold: {
    label: 'Frío',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
} as const;

export function OpportunityCard({ opportunity, stageColor, onOpenPanel }: OpportunityCardProps) {
  const isClosed = opportunity.stage === 'cerrado';
  const isArchived = isClosed && opportunity.outcome === 'perdido';
  const isGanado = isClosed && opportunity.outcome === 'ganado';
  const activityIndicator = getActivityStatus(opportunity.lastActivityAt, opportunity.createdAt);
  const agingLevel = getAgingLevel(opportunity);
  const daysInStage = getDaysInStage(opportunity);
  const agingBadge = AGING_BADGE[agingLevel];
  const checklistDone = opportunity.checklist?.filter((i) => i.done).length ?? 0;
  const checklistTotal = opportunity.checklist?.length ?? 0;
  const checklistVisible = opportunity.checklist?.slice(0, 3) ?? [];
  const checklistHidden = checklistTotal > 3 ? checklistTotal - 3 : 0;
  const weightedAmount = opportunity.estimatedAmount * STAGE_PROBABILITY[opportunity.stage];
  const leadScoreCfg = opportunity.leadScore ? LEAD_SCORE_CONFIG[opportunity.leadScore] : null;

  return (
    <div
      onClick={() => onOpenPanel(opportunity.id)}
      draggable={!isClosed}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', opportunity.id);
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLElement).style.opacity = '0.45';
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '';
      }}
      className={cn(
        'group relative bg-card rounded-2xl border border-border/60 p-4 select-none',
        'transition-all duration-200',
        !isClosed &&
          'cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-black/5 hover:border-border hover:-translate-y-0.5',
        isGanado && 'cursor-pointer hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
        isArchived && 'opacity-55 cursor-pointer'
      )}
    >
      {/* Left accent bar based on stage */}
      {/* <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: stageColor }}
      /> */}

      {/* Row 1: Avatar + name + badges */}
      <div className="flex items-start gap-2.5">
        <DealAvatar name={opportunity.clientName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
            {opportunity.clientName}
          </p>
          {opportunity.mainProduct && (
            <div className="flex items-center gap-1 mt-0.5">
              <Package size={10} className="text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">
                {opportunity.mainProduct}
              </span>
            </div>
          )}
        </div>
        {/* Right badges column */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isGanado && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Trophy size={8} />
              Ganado
            </span>
          )}
          {isArchived && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
              <XCircle size={8} />
              Perdido
            </span>
          )}
          {leadScoreCfg && !isClosed && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                leadScoreCfg.className
              )}
            >
              <Flame size={8} />
              {leadScoreCfg.label}
            </span>
          )}
          {agingBadge && daysInStage > 0 && !isClosed && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                agingBadge.className
              )}
            >
              <AlertTriangle size={8} />
              {daysInStage}d
            </span>
          )}
        </div>
      </div>

      {/* Amount section */}
      <div className="mt-4">
        <span className="text-base font-extrabold" style={{ color: stageColor }}>
          {formatCurrency(opportunity.estimatedAmount)}
        </span>
        {!isClosed && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            ≈ {formatCurrency(weightedAmount)} ponderado
          </p>
        )}
      </div>

      {/* Checklist (after amount, as requested) */}
      {checklistTotal > 0 && !isClosed && (
        <div className="mt-3 space-y-1.5">
          {checklistVisible.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0',
                  item.done ? 'bg-success border-success' : 'border-border/60'
                )}
              >
                {item.done && <Check size={8} className="text-white" />}
              </div>
              <span
                className={cn(
                  'text-[10px] text-muted-foreground truncate leading-snug',
                  item.done && 'line-through opacity-40'
                )}
              >
                {item.text}
              </span>
            </div>
          ))}
          {checklistHidden > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPanel(opportunity.id);
              }}
              className="text-[10px] text-primary hover:underline pl-5 font-medium"
            >
              +{checklistHidden} más
            </button>
          )}
        </div>
      )}

      {/* Footer: activity status + checklist summary */}
      <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', activityIndicator.color)} />
          <span className="text-[10px] text-muted-foreground">{activityIndicator.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {opportunity.source === 'LinkedIn' && opportunity.linkedIn && (
            <LinkedInValidationBadge profile={opportunity.linkedIn} />
          )}
          {checklistTotal > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckSquare size={10} />
              <span>
                {checklistDone}/{checklistTotal}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
