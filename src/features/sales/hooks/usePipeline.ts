'use client';

import { useMemo, useState } from 'react';
import { PIPELINE_STAGES } from 'src/_mock/_sales';
import type { Opportunity, StageId } from 'src/features/sales/types/sales.types';

import { computeLeadScore, STAGE_PROBABILITY } from '../config/pipeline.config';
import { useSalesContext } from '../context/SalesContext';

export function usePipeline() {
  const { opportunities, addOpportunity, moveOpportunity } = useSalesContext();

  const [filters, setFilters] = useState({
    search: '',
    source: '',
    mainProduct: '',
  });

  const stages = PIPELINE_STAGES;

  // Enriquecer oportunidades activas con lead score calculado
  const scoredOpportunities = useMemo<Opportunity[]>(
    () =>
      opportunities.map((opp) => {
        if (opp.stage === 'cerrado') return opp;
        const { score, label } = computeLeadScore(opp);
        return { ...opp, leadScore: label, leadScoreValue: score };
      }),
    [opportunities]
  );

  const filteredOpportunities = useMemo(() => {
    return scoredOpportunities.filter((opp) => {
      const matchSearch =
        !filters.search ||
        opp.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        opp.contactName?.toLowerCase().includes(filters.search.toLowerCase());
      const matchSource = !filters.source || opp.source === filters.source;
      const matchProduct = !filters.mainProduct || opp.mainProduct === filters.mainProduct;
      return matchSearch && matchSource && matchProduct;
    });
  }, [scoredOpportunities, filters]);

  const opportunitiesByStage = useMemo(() => {
    const map = new Map<StageId, Opportunity[]>();
    stages.forEach((s) => map.set(s.id, []));
    filteredOpportunities.forEach((opp) => {
      const list = map.get(opp.stage);
      if (list) list.push(opp);
    });
    return map;
  }, [filteredOpportunities, stages]);

  const metrics = useMemo(() => {
    const active = filteredOpportunities.filter((o) => o.stage !== 'cerrado');
    const closedWon = filteredOpportunities.filter(
      (o) => o.stage === 'cerrado' && o.outcome === 'ganado'
    );

    const totalPipelineValue = active.reduce((sum, o) => sum + o.estimatedAmount, 0);
    const forecastValue = active.reduce(
      (sum, o) => sum + o.estimatedAmount * STAGE_PROBABILITY[o.stage],
      0
    );

    return {
      totalPipelineValue,
      forecastValue,
      activeCount: active.length,
      closedWonCount: closedWon.length,
    };
  }, [filteredOpportunities]);

  return {
    stages,
    opportunitiesByStage,
    metrics,
    filters,
    setFilters,
    addOpportunity,
    moveOpportunity,
  };
}
