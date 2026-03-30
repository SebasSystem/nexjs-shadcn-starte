// ─── Actividades y Notas ───────────────────────────────────────────────────────

export type ActivityType = 'llamada' | 'email' | 'reunion' | 'demo' | 'seguimiento';
export type ActivityStatus = 'pendiente' | 'completada' | 'cancelada';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  responsible: string;
  status: ActivityStatus;
  notes?: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export type LeadSource =
  | 'Web'
  | 'Facebook Ads'
  | 'LinkedIn'
  | 'Referido'
  | 'Evento'
  | 'Email'
  | 'Otro';

// ─── Pipeline ────────────────────────────────────────────────────────────────

export type StageId =
  | 'prospecto'
  | 'cotizacion-enviada'
  | 'negociacion'
  | 'cerrado-ganado'
  | 'cerrado-perdido';

export interface PipelineStage {
  id: StageId;
  label: string;
  color: string;
}

export interface Opportunity {
  id: string;
  clientName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  estimatedAmount: number;
  expectedCloseDate: string;
  stage: StageId;
  quotationId: string | null;
  createdAt: string;

  // Nuevos campos del flujo final
  source: LeadSource;
  mainProduct?: string;
  owner?: string;
  probability?: number;

  activities: Activity[];
  notes: Note[];

  lastActivityAt?: string;
  nextActivityAt?: string;
}

// ─── Cotizaciones ─────────────────────────────────────────────────────────────

export interface ProductLine {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  discount: number; // porcentaje
}

export interface Quotation {
  id: string;
  opportunityId: string;
  client: string;
  priceList: string;
  date: string;
  seller: string;
  status: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
  products: ProductLine[];
  internalNotes: string;
}

// ─── Facturas ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  method: string;
  date: string;
  reference: string;
  amount: number;
  status: 'confirmado' | 'pendiente';
}

export interface InvoiceLine {
  code: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  quotationId: string;
  client: string;
  clientNif: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  seller: string;
  status: 'pendiente' | 'parcial' | 'pagada';
  total: number;
  totalPaid: number;
  products: InvoiceLine[];
  payments: Payment[];
  paymentReminderDate?: string;
}
