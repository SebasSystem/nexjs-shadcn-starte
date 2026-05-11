'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { diffDays } from 'src/lib/date';
import { queryKeys } from 'src/lib/query-keys';

import { opportunityService } from '../services/opportunity.service';
import type { Opportunity, PipelineStage } from '../types/sales.types';

export type AgingLevel = 'normal' | 'warning' | 'risk' | 'stalled';

export function useOpportunityPanel(opportunities: Opportunity[] = []) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: stages = [] } = useQuery<PipelineStage[]>({
    queryKey: queryKeys.sales.stages,
    queryFn: () => opportunityService.getStages(),
    staleTime: 0,
  });

  // GET /opportunities/{uid} — detail con lost_reasons, owner, etc.
  const { data: detailedOpportunity } = useQuery<Opportunity>({
    queryKey: queryKeys.sales.opportunityDetail(selectedId!),
    queryFn: () => opportunityService.getOne(selectedId!),
    enabled: !!selectedId,
    staleTime: 0,
  });

  // Búsqueda local como fallback rápido mientras carga el detalle
  const opportunity = useMemo(() => {
    if (!selectedId) return null;
    // Preferir datos del endpoint detalle (tiene lost_reasons, etc.)
    if (detailedOpportunity) return detailedOpportunity;
    // Fallback: buscar en los datos del board ya cargados
    return opportunities.find((o) => o.uid === selectedId) ?? null;
  }, [selectedId, opportunities, detailedOpportunity]);

  // ─── Derived values ─────────────────────────────────────────────────────────

  const currentStage = stages.find((s) => s.uid === opportunity?.stage_uid);
  const weightedAmount = opportunity
    ? (opportunity.amount || 0) * ((currentStage?.probability_percent ?? 0) / 100)
    : 0;

  const daysInStage = useMemo(() => {
    if (!opportunity?.created_at) return 0;
    return diffDays(opportunity.created_at);
  }, [opportunity]);

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
  };
}
