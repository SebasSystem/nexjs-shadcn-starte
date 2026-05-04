import React from 'react';
import { PIPELINE_STAGES } from 'src/_mock/_sales';
import { cn } from 'src/lib/utils';

import type { StageId } from '../types/sales.types';

const ACTIVE_STAGES: StageId[] = ['leads', 'contactado', 'negociacion', 'cerrado'];

interface StageProgressBarProps {
  currentStage: StageId;
  outcome?: 'ganado' | 'perdido';
}

export function StageProgressBar({ currentStage, outcome }: StageProgressBarProps) {
  const isLost = currentStage === 'cerrado' && outcome === 'perdido';

  if (isLost) {
    return (
      <div className="flex items-center py-2 w-full max-w-sm">
        {ACTIVE_STAGES.map((stageId, i) => {
          const stage = PIPELINE_STAGES.find((s) => s.id === stageId)!;
          return (
            <React.Fragment key={stageId}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full opacity-30"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-[9px] text-muted-foreground/40 font-medium truncate w-14 text-center hidden sm:block">
                  {stage.label}
                </span>
              </div>
              {i < ACTIVE_STAGES.length - 1 && <div className="h-px flex-1 bg-border/30 mb-4" />}
            </React.Fragment>
          );
        })}
        <div className="h-px w-3 bg-border/30 mb-4" />
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-[9px] text-destructive font-bold hidden sm:block">Perdido</span>
        </div>
      </div>
    );
  }

  const currentIndex = ACTIVE_STAGES.indexOf(currentStage);

  return (
    <div className="flex items-center py-2 w-full max-w-sm">
      {ACTIVE_STAGES.map((stageId, i) => {
        const stage = PIPELINE_STAGES.find((s) => s.id === stageId)!;
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <React.Fragment key={stageId}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  'rounded-full transition-all',
                  isCurrent ? 'w-3 h-3 ring-2 ring-offset-1 ring-offset-background' : 'w-2.5 h-2.5',
                  isDone || isCurrent ? 'opacity-100' : 'opacity-25'
                )}
                style={{
                  backgroundColor: stage.color,
                  ...(isCurrent ? { boxShadow: `0 0 0 2px ${stage.color}40` } : {}),
                }}
              />
              <span
                className={cn(
                  'text-[9px] font-medium truncate w-14 text-center hidden sm:block',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < ACTIVE_STAGES.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 transition-all mb-4',
                  isDone ? 'opacity-70' : 'opacity-15'
                )}
                style={{ backgroundColor: stage.color }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
