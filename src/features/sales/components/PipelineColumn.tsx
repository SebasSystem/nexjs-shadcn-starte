'use client';

import { useState } from 'react';
import type { Opportunity, PipelineStage, StageId } from 'src/features/sales/types/sales.types';
import { formatMoney } from 'src/lib/currency';
import { cn } from 'src/lib/utils';

import { STAGE_PROBABILITY } from '../config/pipeline.config';
import { OpportunityCard } from './OpportunityCard';

interface PipelineColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
  onCardDrop: (oppId: string, targetStage: StageId) => void;
  onOpenPanel: (id: string) => void;
}

export function PipelineColumn({
  stage,
  opportunities,
  onCardDrop,
  onOpenPanel,
}: PipelineColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isTerminal = stage.id === 'cerrado';
  const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedAmount, 0);
  const weightedValue = opportunities.reduce(
    (sum, o) => sum + o.estimatedAmount * STAGE_PROBABILITY[o.stage],
    0
  );

  return (
    <div className="flex flex-col flex-1 min-w-[260px]">
      {/* Mini stats */}
      <div className="flex items-center justify-between mb-2 px-0.5 h-8">
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
        >
          {opportunities.length}
        </span>
        {opportunities.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">
              {formatMoney(totalValue, { maximumFractionDigits: 0 })}
            </p>
            {!isTerminal && (
              <p className="text-[9px] text-muted-foreground/50 leading-tight">
                {formatMoney(weightedValue, { maximumFractionDigits: 0 })} pond.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drop zone — sin contenedor visible en estado normal */}
      <div
        className={cn(
          'flex flex-col gap-2.5 min-h-[200px] rounded-2xl transition-all duration-200',
          isDragOver && 'bg-primary/4'
        )}
        style={isDragOver ? { outline: `2px solid ${stage.color}60` } : {}}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (!isDragOver) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const oppId = e.dataTransfer.getData('text/plain');
          if (oppId) onCardDrop(oppId, stage.id);
        }}
      >
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-border/30 text-muted-foreground/30">
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
