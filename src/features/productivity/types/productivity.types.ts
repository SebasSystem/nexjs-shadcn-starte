// ─────────────────────────────────────────────────────────────────────────────
// Productivity — Domain types (snake_case, backend-aligned)
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type ActivityType = 'TASK' | 'REMINDER' | 'MEETING';
export type InteractionType = 'NOTE' | 'CALL' | 'EMAIL' | 'SYSTEM';
export type ActivitySource = 'agenda' | 'pipeline' | 'project';

// ─── Status configs (UI presentation constants) ────────────────────────────────

export const ACTIVITY_STATUS_CONFIG: Record<
  ActivityStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  PENDING: { label: 'Pendiente', color: 'secondary' },
  COMPLETED: { label: 'Completado', color: 'success' },
  OVERDUE: { label: 'Vencido', color: 'error' },
};

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  TASK: { label: 'Tarea', color: 'info' },
  REMINDER: { label: 'Recordatorio', color: 'warning' },
  MEETING: { label: 'Reunión', color: 'secondary' },
};

export const INTERACTION_TYPE_CONFIG: Record<InteractionType, { label: string; icon: string }> = {
  NOTE: { label: 'Nota', icon: 'StickyNote' },
  CALL: { label: 'Llamada', icon: 'PhoneCall' },
  EMAIL: { label: 'Correo', icon: 'Mail' },
  SYSTEM: { label: 'Sistema', icon: 'Activity' },
};

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Activity {
  uid: string;
  contact_uid?: string;
  contact_name?: string;
  type: ActivityType;
  title: string;
  description?: string;
  status: ActivityStatus;
  due_date: string;
  assigned_to_uid?: string;
  assigned_to_name: string;
  // Source provenance
  source?: ActivitySource;
  source_uid?: string;
  source_path?: string;
  source_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Interaction {
  uid: string;
  contact_uid: string;
  type: InteractionType;
  content: string;
  author: string;
  created_at: string;
}

export interface Document {
  uid: string;
  contact_uid: string;
  file_name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

// ─── Payload types (for create/update operations) ──────────────────────────────

export interface ActivityPayload {
  contact_uid?: string;
  contact_name?: string;
  type: ActivityType;
  title: string;
  description?: string;
  due_date: string;
  assigned_to_name?: string;
  source?: ActivitySource;
  source_uid?: string;
  source_path?: string;
  source_label?: string;
}

export interface InteractionPayload {
  type: InteractionType;
  content: string;
}
