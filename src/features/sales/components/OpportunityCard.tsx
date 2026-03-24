'use client';

import { useRouter } from 'next/navigation';
import { Package, Globe, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import type { Opportunity } from 'src/types/sales';

interface OpportunityCardProps {
  opportunity: Opportunity;
  stageColor: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getActivityStatus(lastActivityAt?: string, createdAt?: string) {
  const dateStr = lastActivityAt || createdAt;
  if (!dateStr) return { color: 'bg-slate-400', label: 'Sin datos' };

  // Calcular diferencia de días contra hoy
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

export function OpportunityCard({ opportunity, stageColor }: OpportunityCardProps) {
  const router = useRouter();
  const isArchived = opportunity.stage === 'cerrado-perdido';

  const handleClick = () => {
    const targetId = opportunity.quotationId || opportunity.id;
    router.push(paths.sales.quotation(targetId));
  };

  const activityIndicator = getActivityStatus(opportunity.lastActivityAt, opportunity.createdAt);

  return (
    <div
      onClick={handleClick}
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
      {/* Indicador de Actividad + Creado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5" title={activityIndicator.label}>
          <div className={cn('w-2 h-2 rounded-full', activityIndicator.color)} />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {activityIndicator.label}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {formatDate(opportunity.createdAt)}
        </span>
      </div>

      {/* Client name & Product */}
      <p className="text-subtitle2 text-foreground font-bold leading-snug mb-1 group-hover:text-primary transition-colors">
        {opportunity.clientName}
      </p>

      {opportunity.mainProduct && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 border border-border/50 px-2 py-1 bg-muted/20 rounded-md w-max max-w-full">
          <Package size={12} className="shrink-0" />
          <span className="truncate leading-none">{opportunity.mainProduct}</span>
        </div>
      )}

      {/* Amount & Source */}
      <div className="flex items-center justify-between mt-4">
        <div
          className="flex items-center gap-1 text-sm font-extrabold text-foreground"
          style={{ color: stageColor }}
        >
          <span>{formatCurrency(opportunity.estimatedAmount)}</span>
        </div>

        {opportunity.source && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            <Globe size={11} className="shrink-0" />
            <span>{opportunity.source}</span>
          </div>
        )}
      </div>

      {/* Quotation / Extra Context */}
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <Clock size={11} className="shrink-0" />
          <span>
            Próx:{' '}
            {opportunity.nextActivityAt ? formatDate(opportunity.nextActivityAt) : 'Sin asignar'}
          </span>
        </div>
        {opportunity.quotationId && (
          <span className="text-[10px] text-primary/70 font-mono font-bold bg-primary/5 px-1.5 py-0.5 rounded">
            {opportunity.quotationId}
          </span>
        )}
      </div>
    </div>
  );
}
