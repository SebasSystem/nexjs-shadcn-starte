// ─── Competitor ───────────────────────────────────────────────────────────────

export type CompetitorTier = 'direct' | 'indirect' | 'emerging';

export interface Competitor {
  id: string;
  name: string;
  website?: string;
  tier: CompetitorTier;
}

// ─── Battlecard ───────────────────────────────────────────────────────────────

export interface BattlecardObjection {
  id: string;
  objection: string;
  response: string;
}

export interface Battlecard {
  id: string;
  competitorId: string;
  competitorName: string;
  summary: string;
  ourStrengths: string[];
  theirStrengths: string[];
  objections: BattlecardObjection[];
  winRate: number;
  dealsTracked: number;
  dealsWon: number;
  updatedAt: string;
  createdAt: string;
}

// ─── Lost Deal ────────────────────────────────────────────────────────────────

export type LostReasonCategory =
  | 'price'
  | 'features'
  | 'relationship'
  | 'support'
  | 'timing'
  | 'competitor'
  | 'no_decision'
  | 'other';

export interface LostDeal {
  id: string;
  opportunityName: string;
  clientName: string;
  amount: number;
  currency: 'USD' | 'COP' | 'MXN';
  competitorId?: string;
  competitorName?: string;
  lostReasonCategory: LostReasonCategory;
  lostReasonDetail: string;
  lostDate: string;
  salesRepName: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface IntelligenceStats {
  totalCompetitors: number;
  avgWinRate: number;
  totalLostDeals: number;
  totalLostAmount: number;
  topCompetitor: string;
  topLostReason: LostReasonCategory;
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  competitorId: string;
  competitorName: string;
  reason: LostReasonCategory;
  count: number;
}
