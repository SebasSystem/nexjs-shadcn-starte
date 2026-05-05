import type { BadgeColor } from 'src/shared/components/ui';

// ─── Competitor ───────────────────────────────────────────────────────────────

export type CompetitorTier = 'direct' | 'indirect' | 'emerging';

export interface Competitor {
  uid: string;
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
  uid: string;
  competitor_uid: string;
  competitor_name: string;
  summary: string;
  our_strengths: string[];
  their_strengths: string[];
  objections: BattlecardObjection[];
  win_rate: number;
  deals_tracked: number;
  deals_won: number;
  updated_at: string;
  created_at: string;
  deals_value?: number;
}

// ─── Lost Reason ──────────────────────────────────────────────────────────────

export type LostReasonCategory =
  | 'price'
  | 'features'
  | 'relationship'
  | 'support'
  | 'timing'
  | 'competitor'
  | 'no_decision'
  | 'other';

export interface LostReason {
  uid: string;
  opportunity_name: string;
  client_name: string;
  amount: number;
  currency: 'USD' | 'COP' | 'MXN';
  competitor_uid?: string;
  competitor_name?: string;
  lost_reason_category: LostReasonCategory;
  lost_reason_detail: string;
  lost_date: string;
  sales_rep_name: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface IntelligenceStats {
  total_competitors: number;
  avg_win_rate: number;
  total_lost_deals: number;
  total_lost_amount: number;
  top_competitor: string;
  top_lost_reason: LostReasonCategory;
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  competitor_uid: string;
  competitor_name: string;
  reason: LostReasonCategory;
  count: number;
}

// ─── UI Config ────────────────────────────────────────────────────────────────

export const COMPETITOR_TIER_CONFIG: Record<CompetitorTier, { label: string; color: BadgeColor }> =
  {
    direct: { label: 'Directo', color: 'error' },
    indirect: { label: 'Indirecto', color: 'warning' },
    emerging: { label: 'Emergente', color: 'info' },
  };

export const LOST_REASON_LABELS: Record<LostReasonCategory, string> = {
  price: 'Precio',
  features: 'Funcionalidades',
  relationship: 'Relación previa',
  support: 'Soporte / Implementación',
  timing: 'Timing / Presupuesto',
  competitor: 'Ganó la competencia',
  no_decision: 'Sin decisión',
  other: 'Otro',
};

export const LOST_REASON_OPTIONS = (
  Object.entries(LOST_REASON_LABELS) as [LostReasonCategory, string][]
).map(([value, label]) => ({ value, label }));
