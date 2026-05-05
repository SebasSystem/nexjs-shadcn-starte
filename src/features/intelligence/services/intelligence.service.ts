import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Battlecard, Competitor, LostReason } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mappers — lightweight validators (types are already snake_case)
// ─────────────────────────────────────────────────────────────────────────────

function mapBattlecard(raw: Record<string, unknown>): Battlecard {
  return {
    uid: raw.uid as string,
    competitor_uid: raw.competitor_uid as string,
    competitor_name: raw.competitor_name as string,
    summary: raw.summary as string,
    our_strengths: (raw.our_strengths as string[]) ?? [],
    their_strengths: (raw.their_strengths as string[]) ?? [],
    objections: (raw.objections as Battlecard['objections']) ?? [],
    win_rate: raw.win_rate as number,
    deals_tracked: raw.deals_tracked as number,
    deals_won: raw.deals_won as number,
    updated_at: raw.updated_at as string,
    created_at: raw.created_at as string,
    deals_value: raw.deals_value as number | undefined,
  };
}

function mapLostReason(raw: Record<string, unknown>): LostReason {
  return {
    uid: raw.uid as string,
    opportunity_name: raw.opportunity_name as string,
    client_name: raw.client_name as string,
    amount: raw.amount as number,
    currency: (raw.currency as LostReason['currency']) ?? 'USD',
    competitor_uid: raw.competitor_uid as string | undefined,
    competitor_name: raw.competitor_name as string | undefined,
    lost_reason_category: raw.lost_reason_category as LostReason['lost_reason_category'],
    lost_reason_detail: raw.lost_reason_detail as string,
    lost_date: raw.lost_date as string,
    sales_rep_name: raw.sales_rep_name as string,
  };
}

function mapCompetitor(raw: Record<string, unknown>): Competitor {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    website: raw.website as string | undefined,
    tier: raw.tier as Competitor['tier'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const intelligenceService = {
  // ── Battlecards ──────────────────────────────────────────────────────────

  battlecards: {
    getAll: async (): Promise<Battlecard[]> => {
      try {
        const res = await axiosInstance.get(endpoints.intelligence.battlecards.list);
        const data = res.data?.data ?? res.data ?? [];
        return (data as Record<string, unknown>[]).map(mapBattlecard);
      } catch {
        return [];
      }
    },

    getById: async (uid: string): Promise<Battlecard | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.intelligence.battlecards.detail(uid));
        const data = res.data?.data ?? res.data;
        return mapBattlecard(data as Record<string, unknown>);
      } catch {
        return undefined;
      }
    },

    create: async (
      payload: Omit<
        Battlecard,
        | 'uid'
        | 'win_rate'
        | 'deals_tracked'
        | 'deals_won'
        | 'created_at'
        | 'updated_at'
        | 'deals_value'
      >
    ): Promise<Battlecard> => {
      const res = await axiosInstance.post(endpoints.intelligence.battlecards.create, payload);
      const data = res.data?.data ?? res.data;
      return mapBattlecard(data as Record<string, unknown>);
    },

    update: async (
      uid: string,
      payload: Partial<
        Omit<
          Battlecard,
          'uid' | 'win_rate' | 'deals_tracked' | 'deals_won' | 'created_at' | 'updated_at'
        >
      >
    ): Promise<Battlecard> => {
      const res = await axiosInstance.put(endpoints.intelligence.battlecards.update(uid), payload);
      const data = res.data?.data ?? res.data;
      return mapBattlecard(data as Record<string, unknown>);
    },

    delete: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.intelligence.battlecards.delete(uid));
    },
  },

  // ── Lost Reasons ─────────────────────────────────────────────────────────

  lostReasons: {
    getAll: async (): Promise<LostReason[]> => {
      try {
        const res = await axiosInstance.get(endpoints.intelligence.lostReasons.list);
        const data = res.data?.data ?? res.data ?? [];
        return (data as Record<string, unknown>[]).map(mapLostReason);
      } catch {
        return [];
      }
    },

    create: async (payload: Omit<LostReason, 'uid'>): Promise<LostReason> => {
      const res = await axiosInstance.post(endpoints.intelligence.lostReasons.create, payload);
      const data = res.data?.data ?? res.data;
      return mapLostReason(data as Record<string, unknown>);
    },

    update: async (uid: string, payload: Partial<Omit<LostReason, 'uid'>>): Promise<LostReason> => {
      const res = await axiosInstance.put(endpoints.intelligence.lostReasons.update(uid), payload);
      const data = res.data?.data ?? res.data;
      return mapLostReason(data as Record<string, unknown>);
    },

    delete: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.intelligence.lostReasons.delete(uid));
    },
  },

  // ── Competitors ──────────────────────────────────────────────────────────

  competitors: {
    getAll: async (): Promise<Competitor[]> => {
      try {
        const res = await axiosInstance.get(endpoints.intelligence.competitors.list);
        const data = res.data?.data ?? res.data ?? [];
        return (data as Record<string, unknown>[]).map(mapCompetitor);
      } catch {
        return [];
      }
    },
  },
};
