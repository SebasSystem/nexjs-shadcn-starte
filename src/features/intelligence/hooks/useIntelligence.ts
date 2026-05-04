'use client';

import { useMemo, useState } from 'react';
import { MOCK_BATTLECARDS, MOCK_COMPETITORS, MOCK_LOST_DEALS } from 'src/_mock/_intelligence';

import type {
  Battlecard,
  HeatmapCell,
  IntelligenceStats,
  LostDeal,
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
  const [battlecards, setBattlecards] = useState<Battlecard[]>(MOCK_BATTLECARDS);
  const [lostDeals, setLostDeals] = useState<LostDeal[]>(MOCK_LOST_DEALS);

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats: IntelligenceStats = useMemo(() => {
    const avgWinRate =
      battlecards.length > 0
        ? Math.round(battlecards.reduce((acc, bc) => acc + bc.winRate, 0) / battlecards.length)
        : 0;

    const totalLostAmount = lostDeals.reduce((acc, d) => acc + d.amount, 0);

    const competitorCounts = lostDeals.reduce<Record<string, number>>((acc, d) => {
      if (d.competitorName) {
        acc[d.competitorName] = (acc[d.competitorName] ?? 0) + 1;
      }
      return acc;
    }, {});
    const topCompetitor =
      Object.entries(competitorCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—';

    const reasonCounts = lostDeals.reduce<Record<string, number>>((acc, d) => {
      acc[d.lostReasonCategory] = (acc[d.lostReasonCategory] ?? 0) + 1;
      return acc;
    }, {});
    const topLostReason = (Object.entries(reasonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      'price') as LostReasonCategory;

    return {
      totalCompetitors: MOCK_COMPETITORS.length,
      avgWinRate,
      totalLostDeals: lostDeals.length,
      totalLostAmount,
      topCompetitor,
      topLostReason,
    };
  }, [battlecards, lostDeals]);

  // ─── Heatmap ───────────────────────────────────────────────────────────────

  const heatmapData: HeatmapCell[] = useMemo(() => {
    const rows: { id: string; name: string }[] = [
      ...MOCK_COMPETITORS.map((c) => ({ id: c.id, name: c.name })),
      { id: 'none', name: 'Sin competidor' },
    ];

    return rows.flatMap((row) =>
      ALL_REASONS.map((reason) => ({
        competitorId: row.id,
        competitorName: row.name,
        reason,
        count: lostDeals.filter(
          (d) => (d.competitorId ?? 'none') === row.id && d.lostReasonCategory === reason
        ).length,
      }))
    );
  }, [lostDeals]);

  // ─── CRUD Battlecards ──────────────────────────────────────────────────────

  const createBattlecard = (
    data: Omit<
      Battlecard,
      'id' | 'winRate' | 'dealsTracked' | 'dealsWon' | 'createdAt' | 'updatedAt'
    >
  ) => {
    const now = new Date().toISOString().split('T')[0];
    setBattlecards((prev) => [
      ...prev,
      {
        ...data,
        id: `bc-${Date.now()}`,
        winRate: 0,
        dealsTracked: 0,
        dealsWon: 0,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  const updateBattlecard = (id: string, changes: Partial<Battlecard>) => {
    const now = new Date().toISOString().split('T')[0];
    setBattlecards((prev) =>
      prev.map((bc) => (bc.id === id ? { ...bc, ...changes, updatedAt: now } : bc))
    );
  };

  const deleteBattlecard = (id: string) => {
    setBattlecards((prev) => prev.filter((bc) => bc.id !== id));
  };

  // ─── CRUD Lost Deals ───────────────────────────────────────────────────────

  const createLostDeal = (data: Omit<LostDeal, 'id'>) => {
    setLostDeals((prev) => [...prev, { ...data, id: `ld-${Date.now()}` }]);
  };

  const updateLostDeal = (id: string, changes: Partial<LostDeal>) => {
    setLostDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const deleteLostDeal = (id: string) => {
    setLostDeals((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    battlecards,
    lostDeals,
    competitors: MOCK_COMPETITORS,
    stats,
    heatmapData,
    createBattlecard,
    updateBattlecard,
    deleteBattlecard,
    createLostDeal,
    updateLostDeal,
    deleteLostDeal,
  };
}
