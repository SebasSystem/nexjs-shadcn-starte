'use client';

import { cn } from 'src/lib/utils';
import { STAGE_PROBABILITY } from '../config/pipeline.config';
import { OpportunityCard } from './OpportunityCard';
import type { PipelineStage, Opportunity, StageId } from 'src/features/sales/types/sales.types';

interface PipelineColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
  onCardDrop: (oppId: string, targetStage: StageId) => void;
  onOpenPanel: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PipelineColumn({
  stage,
  opportunities,
  onCardDrop,
  onOpenPanel,
}: PipelineColumnProps) {
  const isTerminal = stage.id === 'cerrado-ganado' || stage.id === 'cerrado-perdido';
  const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedAmount, 0);
  const weightedValue = opportunities.reduce(
    (sum, o) => sum + o.estimatedAmount * STAGE_PROBABILITY[o.stage],
    0
  );

  return (
    <div
      className="flex flex-col min-w-[280px] max-w-[280px] w-[280px] flex-shrink-0 transition-opacity rounded-2xl p-3 border"
      style={{ backgroundColor: `${stage.color}08`, borderColor: `${stage.color}15` }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const oppId = e.dataTransfer.getData('text/plain');
        if (oppId) onCardDrop(oppId, stage.id);
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between mb-2 px-1 py-1 rounded-xl',
          'border border-transparent'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-semibold text-foreground">{stage.label}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center"
          style={{ backgroundColor: `${stage.color}25`, color: stage.color }}
        >
          {opportunities.length}
        </span>
      </div>

      {/* Value summary */}
      <div className="h-10 px-1 mb-2">
        {opportunities.length > 0 && !isTerminal && (
          <div>
            <p className="text-caption text-muted-foreground">{formatCurrency(totalValue)} total</p>
            <p className="text-[10px] text-muted-foreground/60">
              {formatCurrency(weightedValue)} ponderado
            </p>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 min-h-[120px]">
        {opportunities.length === 0 ? (
          <div
            className={cn(
              'flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed',
              'border-border/40 text-muted-foreground/40'
            )}
          >
            <span className="text-xs">Sin oportunidades</span>
          </div>
        ) : (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              stageColor={stage.color}
              onOpenPanel={onOpenPanel}
            />
          ))
        )}
      </div>
    </div>
  );
}
