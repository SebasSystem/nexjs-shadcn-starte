'use client';

import { useState, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { useSalesContext } from '../context/SalesContext';
import { STAGE_AGING_THRESHOLDS, STAGE_PROBABILITY } from '../config/pipeline.config';

export type AgingLevel = 'normal' | 'warning' | 'risk' | 'stalled';

export function useOpportunityPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { opportunities } = useSalesContext();

  const opportunity = useMemo(
    () => (selectedId ? opportunities.find((o) => o.id === selectedId) : undefined),
    [opportunities, selectedId]
  );

  const daysInStage = useMemo(() => {
    if (!opportunity?.stageEnteredAt) return 0;
    return differenceInDays(new Date(), new Date(opportunity.stageEnteredAt));
  }, [opportunity]);

  const agingLevel = useMemo((): AgingLevel => {
    if (!opportunity) return 'normal';
    const t = STAGE_AGING_THRESHOLDS[opportunity.stage];
    if (daysInStage >= t.stalled) return 'stalled';
    if (daysInStage >= t.risk) return 'risk';
    if (daysInStage >= t.warning) return 'warning';
    return 'normal';
  }, [opportunity, daysInStage]);

  const weightedAmount = useMemo(() => {
    if (!opportunity) return 0;
    return opportunity.estimatedAmount * STAGE_PROBABILITY[opportunity.stage];
  }, [opportunity]);

  return {
    selectedId,
    isOpen: !!selectedId,
    openPanel: (id: string) => setSelectedId(id),
    closePanel: () => setSelectedId(null),
    opportunity,
    daysInStage,
    agingLevel,
    weightedAmount,
  };
}
