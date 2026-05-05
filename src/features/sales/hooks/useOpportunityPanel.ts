'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { diffDays } from 'src/lib/date';
import { queryKeys } from 'src/lib/query-keys';

import { opportunityService } from '../services/opportunity.service';
import type { PipelineStage } from '../types/sales.types';

export type AgingLevel = 'normal' | 'warning' | 'risk' | 'stalled';

export function useOpportunityPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: stages = [] } = useQuery<PipelineStage[]>({
    queryKey: queryKeys.sales.stages,
    queryFn: () => opportunityService.getStages(),
  });

  const {
    data: opportunity = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKeys.sales.opportunityList, selectedId],
    queryFn: () => opportunityService.getOne(selectedId!),
    enabled: !!selectedId,
  });

  // ─── Derived values ─────────────────────────────────────────────────────────

  const currentStage = stages.find((s) => s.uid === opportunity?.stage_uid);
  const weightedAmount = opportunity
    ? (opportunity.amount || 0) * ((currentStage?.probability_percent ?? 0) / 100)
    : 0;

  const daysInStage = useMemo(() => {
    if (!opportunity?.created_at) return 0;
    return diffDays(opportunity.created_at);
  }, [opportunity?.created_at]);

  const agingLevel: AgingLevel =
    daysInStage > 14
      ? 'stalled'
      : daysInStage > 7
        ? 'risk'
        : daysInStage > 3
          ? 'warning'
          : 'normal';

  const openPanel = useCallback((uid: string) => setSelectedId(uid), []);
  const closePanel = useCallback(() => setSelectedId(null), []);

  return {
    selectedId,
    isOpen: !!selectedId,
    openPanel,
    closePanel,
    opportunity,
    currentStage,
    stages,
    weightedAmount,
    daysInStage,
    agingLevel,
    isLoading,
    error: error ?? null,
  };
}
