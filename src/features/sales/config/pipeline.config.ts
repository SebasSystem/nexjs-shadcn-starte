import type { StageId } from '../types/sales.types';

export const STAGE_PROBABILITY: Record<StageId, number> = {
  prospecto: 0.15,
  'cotizacion-enviada': 0.45,
  negociacion: 0.75,
  'cerrado-ganado': 1.0,
  'cerrado-perdido': 0,
};

export const STAGE_AGING_THRESHOLDS: Record<
  StageId,
  { warning: number; risk: number; stalled: number }
> = {
  prospecto: { warning: 5, risk: 10, stalled: 15 },
  'cotizacion-enviada': { warning: 7, risk: 14, stalled: 21 },
  negociacion: { warning: 10, risk: 20, stalled: 30 },
  'cerrado-ganado': { warning: 999, risk: 999, stalled: 999 },
  'cerrado-perdido': { warning: 999, risk: 999, stalled: 999 },
};

export const STAGE_CHECKLIST_TEMPLATES: Partial<Record<StageId, string[]>> = {
  prospecto: [
    'Contactar al cliente',
    'Calificar necesidad',
    'Identificar decisor',
    'Confirmar presupuesto estimado',
  ],
  'cotizacion-enviada': [
    'Enviar cotización formal',
    'Confirmar recepción',
    'Agendar reunión de revisión',
  ],
  negociacion: [
    'Revisar objeciones del cliente',
    'Ajustar propuesta si aplica',
    'Confirmar términos',
    'Obtener aprobación verbal',
  ],
  'cerrado-ganado': ['Enviar contrato final', 'Coordinar onboarding'],
  'cerrado-perdido': [],
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
