'use client';

import { cn } from 'src/lib/utils';
import { OpportunityCard } from './OpportunityCard';
import { useSalesContext } from '../context/SalesContext';
import type { PipelineStage, Opportunity } from 'src/types/sales';

interface PipelineColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PipelineColumn({ stage, opportunities }: PipelineColumnProps) {
  const { moveOpportunity } = useSalesContext();
  const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedAmount, 0);
  const isTerminal = stage.id === 'cerrado-ganado' || stage.id === 'cerrado-perdido';

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
        if (oppId) {
          moveOpportunity(oppId, stage.id);
        }
      }}
    >
      <div
        className={cn(
          'flex items-center justify-between mb-2 px-1 py-1 rounded-xl',
          'border border-transparent'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-semibold text-foreground">{stage.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Count badge */}
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center"
            style={{ backgroundColor: `${stage.color}25`, color: stage.color }}
          >
            {opportunities.length}
          </span>
        </div>
      </div>

      {/* Column value summary — fixed height to prevent misalignment */}
      <div className="h-6 px-1 mb-2">
        {opportunities.length > 0 && !isTerminal && (
          <p className="text-caption text-muted-foreground">{formatCurrency(totalValue)} total</p>
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
            />
          ))
        )}
      </div>
    </div>
  );
}
