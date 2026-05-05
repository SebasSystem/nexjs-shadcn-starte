'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { computeLeadScore } from '../config/pipeline.config';
import { opportunityService } from '../services/opportunity.service';
import type { Opportunity, PipelineStage } from '../types/sales.types';

export function usePipeline() {
  const [search, setSearch] = useState('');

  const {
    data: stages = [] as PipelineStage[],
    isLoading: stagesLoading,
    error: stagesError,
  } = useQuery<PipelineStage[]>({
    queryKey: queryKeys.sales.stages,
    queryFn: () => opportunityService.getStages(),
  });

  const {
    data: opportunities = [] as Opportunity[],
    isLoading: oppsLoading,
    error: oppsError,
  } = useQuery<Opportunity[]>({
    queryKey: queryKeys.sales.opportunities,
    queryFn: async () => {
      const boardData = await opportunityService.getBoard();
      return Array.isArray(boardData) ? boardData : Object.values(boardData).flat();
    },
  });

  const isLoading = stagesLoading || oppsLoading;
  const error = stagesError || oppsError;

  // ─── Lead scoring (client-side using API data) ──────────────────────────────

  const scoredOpportunities = useMemo<Opportunity[]>(
    () =>
      opportunities.map((opp) => {
        const stage = stages.find((s) => s.uid === opp.stage_uid);
        if (stage?.is_won) return opp;
        const { score, label } = computeLeadScore(opp, stages);
        return { ...opp, _leadScoreValue: score, _leadScore: label } as Opportunity & {
          _leadScoreValue: number;
          _leadScore: string;
        };
      }),
    [opportunities, stages]
  );

  // ─── Filters ────────────────────────────────────────────────────────────────

  const filteredOpportunities = useMemo(() => {
    return scoredOpportunities.filter((opp) => {
      const matchSearch = !search || opp.title?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [scoredOpportunities, search]);

  // ─── Group by stage ─────────────────────────────────────────────────────────

  const opportunitiesByStage = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    stages.forEach((s) => map.set(s.uid, []));
    filteredOpportunities.forEach((opp) => {
      const list = map.get(opp.stage_uid);
      if (list) list.push(opp);
    });
    return map;
  }, [filteredOpportunities, stages]);

  // ─── Metrics ────────────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const active = filteredOpportunities.filter((opp) => {
      const stage = stages.find((s) => s.uid === opp.stage_uid);
      return !stage?.is_won && !stage?.is_lost;
    });
    const closedWon = filteredOpportunities.filter((opp) => {
      const stage = stages.find((s) => s.uid === opp.stage_uid);
      return stage?.is_won;
    });

    const totalPipelineValue = active.reduce((sum, o) => sum + (o.amount || 0), 0);
    const forecastValue = active.reduce((sum, o) => {
      const stage = stages.find((s) => s.uid === o.stage_uid);
      return sum + (o.amount || 0) * ((stage?.probability_percent ?? 0) / 100);
    }, 0);

    return {
      totalPipelineValue,
      forecastValue,
      activeCount: active.length,
      closedWonCount: closedWon.length,
    };
  }, [filteredOpportunities, stages]);

  return {
    stages,
    opportunitiesByStage,
    metrics,
    search,
    setSearch,
    isLoading,
    error: (error ?? null) as Error | null,
    refresh: () => {},
  };
}
