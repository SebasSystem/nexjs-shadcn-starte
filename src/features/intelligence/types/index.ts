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
  title?: string;
  competitor_uid: string;
  competitor_name: string;
  summary: string;
  our_strengths?: string[];
  their_strengths?: string[];
  strengths?: string[];
  weaknesses?: string[];
  objections?: BattlecardObjection[];
  win_rate?: number;
  deals_tracked?: number;
  deals_won?: number;
  updated_at?: string;
  created_at?: string;
  deals_value?: number;
}

// ─── Lost Reason ──────────────────────────────────────────────────────────────

export type LostReasonCategory = string;

export interface LostReason {
  uid: string;
  summary: string;
  details?: string;
  reason_type: LostReasonCategory;
  estimated_value: number;
  deal_value?: number;
  lost_at: string;
  competitor_uid?: string;
  competitor_name?: string;
  account_name?: string;
  lost_reason_category: LostReasonCategory;
  lost_reason_detail: string;
  sales_rep?: string;
  closed_date?: string;
  opportunity_uid?: string;
  currency?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface IntelligenceStats {
  total_competitors: number;
  avg_win_rate: number;
  total_lost_deals: number;
  total_lost_amount: number;
  top_competitor: string;
  top_lost_reason: string;
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
