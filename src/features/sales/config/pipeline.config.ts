import { daysUntil, diffDays } from 'src/lib/date';

import type { Opportunity, PipelineStage } from '../types/sales.types';

// ─── Lead Scoring (client-side computation using API data) ─────────────────────

export function computeLeadScore(
  opp: Opportunity,
  stages?: PipelineStage[]
): {
  score: number;
  label: 'hot' | 'warm' | 'cold';
} {
  let score = 0;

  // 1. Recency of activity (0–30 pts) — uses created_at as fallback
  const ref = opp.updated_at ?? opp.created_at;
  if (!ref) return { score: 0, label: 'cold' };
  const daysSince = diffDays(ref);
  if (daysSince <= 2) score += 30;
  else if (daysSince <= 5) score += 20;
  else if (daysSince <= 7) score += 10;

  // 2. Stage probability (0–25 pts)
  const currentStage = stages?.find((s) => s.uid === opp.stage_uid);
  const probability = currentStage?.probability_percent ?? 0;
  score += probability * 0.25;

  // 3. Proximity to close date (0–20 pts)
  const daysToClose = opp.expected_close_date ? daysUntil(opp.expected_close_date) : 0;
  if (daysToClose <= 15) score += 20;
  else if (daysToClose <= 30) score += 15;
  else if (daysToClose <= 60) score += 10;

  // 4. Recency (0–25 pts) — weighted by days since last activity
  if (daysSince <= 3) score += 25;
  else if (daysSince <= 7) score += 15;
  else if (daysSince <= 14) score += 5;

  const total = Math.min(100, Math.round(score));
  return { score: total, label: total >= 70 ? 'hot' : total >= 40 ? 'warm' : 'cold' };
}
