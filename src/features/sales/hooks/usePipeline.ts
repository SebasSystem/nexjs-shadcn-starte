'use client';

import { useMemo, useState } from 'react';
import { useSalesContext } from '../context/SalesContext';
import { PIPELINE_STAGES } from 'src/_mock/_sales';
import type { StageId, Opportunity } from 'src/features/sales/types/sales.types';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePipeline() {
  const { opportunities, addOpportunity, moveOpportunity } = useSalesContext();

  const [filters, setFilters] = useState({
    search: '',
    source: '',
    mainProduct: '',
  });

  const stages = PIPELINE_STAGES;

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchSearch =
        !filters.search ||
        opp.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        opp.contactName?.toLowerCase().includes(filters.search.toLowerCase());
      const matchSource = !filters.source || opp.source === filters.source;
      const matchProduct = !filters.mainProduct || opp.mainProduct === filters.mainProduct;

      return matchSearch && matchSource && matchProduct;
    });
  }, [opportunities, filters]);

  // Oportunidades agrupadas por etapa
  const opportunitiesByStage = useMemo(() => {
    const map = new Map<StageId, Opportunity[]>();
    stages.forEach((s) => map.set(s.id, []));
    filteredOpportunities.forEach((opp) => {
      const list = map.get(opp.stage);
      if (list) list.push(opp);
    });
    return map;
  }, [filteredOpportunities, stages]);

  // Métricas globales del pipeline
  const metrics = useMemo(() => {
    const active = filteredOpportunities.filter(
      (o) => o.stage !== 'cerrado-ganado' && o.stage !== 'cerrado-perdido'
    );
    const closedWon = filteredOpportunities.filter((o) => o.stage === 'cerrado-ganado');

    const totalPipelineValue = active.reduce((sum, o) => sum + o.estimatedAmount, 0);

    return {
      totalPipelineValue,
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
