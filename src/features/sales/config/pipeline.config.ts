import { differenceInDays } from 'date-fns';
import type { StageId, Opportunity } from '../types/sales.types';

export const STAGE_PROBABILITY: Record<StageId, number> = {
  leads: 0.15,
  contactado: 0.45,
  negociacion: 0.75,
  cerrado: 1.0,
};

export const STAGE_AGING_THRESHOLDS: Record<
  StageId,
  { warning: number; risk: number; stalled: number }
> = {
  leads: { warning: 5, risk: 10, stalled: 15 },
  contactado: { warning: 7, risk: 14, stalled: 21 },
  negociacion: { warning: 10, risk: 20, stalled: 30 },
  cerrado: { warning: 999, risk: 999, stalled: 999 },
};

export const STAGE_CHECKLIST_TEMPLATES: Partial<Record<StageId, string[]>> = {
  leads: [
    'Contactar al cliente',
    'Calificar necesidad',
    'Identificar decisor',
    'Confirmar presupuesto estimado',
  ],
  contactado: ['Enviar cotización formal', 'Confirmar recepción', 'Agendar reunión de revisión'],
  negociacion: [
    'Revisar objeciones del cliente',
    'Ajustar propuesta si aplica',
    'Confirmar términos',
    'Obtener aprobación verbal',
  ],
  cerrado: ['Enviar contrato final', 'Coordinar onboarding'],
};

export const STAGE_ACCENT_COLORS: Record<StageId, { accent: string; text: string }> = {
  leads: { accent: '#2563EB', text: '#1E3A8A' },
  contactado: { accent: '#0284C7', text: '#0C4A6E' },
  negociacion: { accent: '#D97706', text: '#78350F' },
  cerrado: { accent: '#16A34A', text: '#14532D' },
};

export const LOST_REASON_LABELS: Record<string, string> = {
  price: 'Precio',
  features: 'Funcionalidades',
  relationship: 'Relación comercial',
  support: 'Soporte',
  timing: 'Timing / Momento',
  competitor: 'Ganó competidor',
  no_decision: 'Sin decisión',
  other: 'Otro',
};

export const LOST_REASON_OPTIONS = Object.entries(LOST_REASON_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ─── Lead Scoring ─────────────────────────────────────────────────────────────

export function computeLeadScore(opp: Opportunity): {
  score: number;
  label: 'hot' | 'warm' | 'cold';
} {
  let score = 0;

  // 1. Recencia de actividad (0–30 pts)
  const ref = opp.lastActivityAt ?? opp.createdAt;
  const safeRef = ref.includes('T') ? ref : `${ref}T12:00:00`;
  const daysSince = differenceInDays(new Date(), new Date(safeRef));
  if (daysSince <= 2) score += 30;
  else if (daysSince <= 5) score += 20;
  else if (daysSince <= 7) score += 10;

  // 2. Probabilidad de cierre (0–25 pts)
  score += (opp.probability ?? 0) * 0.25;

  // 3. Proximidad a fecha de cierre (0–20 pts)
  const safeClose = opp.expectedCloseDate.includes('T')
    ? opp.expectedCloseDate
    : `${opp.expectedCloseDate}T12:00:00`;
  const daysToClose = differenceInDays(new Date(safeClose), new Date());
  if (daysToClose <= 15) score += 20;
  else if (daysToClose <= 30) score += 15;
  else if (daysToClose <= 60) score += 10;

  // 4. Salud del stage / aging (0–25 pts)
  const t = STAGE_AGING_THRESHOLDS[opp.stage];
  const daysInStage = differenceInDays(new Date(), new Date(opp.stageEnteredAt));
  if (daysInStage < t.warning) score += 25;
  else if (daysInStage < t.risk) score += 15;
  else if (daysInStage < t.stalled) score += 5;

  const total = Math.min(100, Math.round(score));
  return { score: total, label: total >= 70 ? 'hot' : total >= 40 ? 'warm' : 'cold' };
}
