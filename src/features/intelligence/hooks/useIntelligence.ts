'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { intelligenceService } from '../services/intelligence.service';
import type {
  Battlecard,
  HeatmapCell,
  IntelligenceStats,
  LostReason,
  LostReasonCategory,
} from '../types';

const ALL_REASONS: LostReasonCategory[] = [
  'price',
  'features',
  'relationship',
  'support',
  'timing',
  'competitor',
  'no_decision',
  'other',
];

export function useIntelligence() {
  const queryClient = useQueryClient();

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: battlecards = [] } = useQuery({
    queryKey: queryKeys.intelligence.battlecards,
    queryFn: () => intelligenceService.battlecards.getAll(),
  });

  const { data: lostReasons = [] } = useQuery({
    queryKey: queryKeys.intelligence.lostReasons,
    queryFn: () => intelligenceService.lostReasons.getAll(),
  });

  const { data: competitors = [] } = useQuery({
    queryKey: queryKeys.intelligence.competitors,
    queryFn: () => intelligenceService.competitors.getAll(),
  });

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats: IntelligenceStats = useMemo(() => {
    const avg_win_rate =
      battlecards.length > 0
        ? Math.round(battlecards.reduce((acc, bc) => acc + bc.win_rate, 0) / battlecards.length)
        : 0;

    const total_lost_amount = lostReasons.reduce((acc, d) => acc + d.amount, 0);

    const competitorCounts = lostReasons.reduce<Record<string, number>>((acc, d) => {
      if (d.competitor_name) {
        acc[d.competitor_name] = (acc[d.competitor_name] ?? 0) + 1;
      }
      return acc;
    }, {});
    const top_competitor =
      Object.entries(competitorCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—';

    const reasonCounts = lostReasons.reduce<Record<string, number>>((acc, d) => {
      acc[d.lost_reason_category] = (acc[d.lost_reason_category] ?? 0) + 1;
      return acc;
    }, {});
    const top_lost_reason = (Object.entries(reasonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      'price') as LostReasonCategory;

    return {
      total_competitors: competitors.length,
      avg_win_rate,
      total_lost_deals: lostReasons.length,
      total_lost_amount,
      top_competitor,
      top_lost_reason,
    };
  }, [battlecards, competitors, lostReasons]);

  // ─── Heatmap ───────────────────────────────────────────────────────────────

  const heatmapData: HeatmapCell[] = useMemo(() => {
    const rows: { uid: string; name: string }[] = [
      ...competitors.map((c) => ({ uid: c.uid, name: c.name })),
      { uid: 'none', name: 'Sin competidor' },
    ];

    return rows.flatMap((row) =>
      ALL_REASONS.map((reason) => ({
        competitor_uid: row.uid,
        competitor_name: row.name,
        reason,
        count: lostReasons.filter(
          (d) => (d.competitor_uid ?? 'none') === row.uid && d.lost_reason_category === reason
        ).length,
      }))
    );
  }, [competitors, lostReasons]);

  // ─── CRUD Battlecards ──────────────────────────────────────────────────────

  const createBattlecard = async (
    data: Omit<
      Battlecard,
      | 'uid'
      | 'win_rate'
      | 'deals_tracked'
      | 'deals_won'
      | 'created_at'
      | 'updated_at'
      | 'deals_value'
    >
  ): Promise<boolean> => {
    try {
      await intelligenceService.battlecards.create(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.battlecards });
      return true;
    } catch {
      return false;
    }
  };

  const updateBattlecard = async (
    uid: string,
    changes: Partial<
      Omit<
        Battlecard,
        'uid' | 'win_rate' | 'deals_tracked' | 'deals_won' | 'created_at' | 'updated_at'
      >
    >
  ): Promise<boolean> => {
    try {
      await intelligenceService.battlecards.update(uid, changes);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.battlecards });
      return true;
    } catch {
      return false;
    }
  };

  const deleteBattlecard = async (uid: string): Promise<boolean> => {
    try {
      await intelligenceService.battlecards.delete(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.battlecards });
      return true;
    } catch {
      return false;
    }
  };

  // ─── CRUD Lost Reasons ───────────────────────────────────────────────────────

  const createLostReason = async (data: Omit<LostReason, 'uid'>): Promise<boolean> => {
    try {
      await intelligenceService.lostReasons.create(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.lostReasons });
      return true;
    } catch {
      return false;
    }
  };

  const updateLostReason = async (
    uid: string,
    changes: Partial<Omit<LostReason, 'uid'>>
  ): Promise<boolean> => {
    try {
      await intelligenceService.lostReasons.update(uid, changes);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.lostReasons });
      return true;
    } catch {
      return false;
    }
  };

  const deleteLostReason = async (uid: string): Promise<boolean> => {
    try {
      await intelligenceService.lostReasons.delete(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.lostReasons });
      return true;
    } catch {
      return false;
    }
  };

  return {
    battlecards,
    lostReasons,
    competitors,
    stats,
    heatmapData,
    createBattlecard,
    updateBattlecard,
    deleteBattlecard,
    createLostReason,
    updateLostReason,
    deleteLostReason,
  };
}
