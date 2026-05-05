export type TriggerSource = 'crm' | 'linkedin' | 'facebook' | 'time';

export type TriggerEvent =
  | 'lead_created'
  | 'lead_stage_changed'
  | 'lead_lost'
  | 'lead_won'
  | 'lead_stalled'
  | 'linkedin_message'
  | 'linkedin_reply'
  | 'linkedin_connection'
  | 'facebook_comment'
  | 'facebook_message'
  | 'facebook_like'
  | 'stage_duration_exceeded'
  | 'inactivity_days';

export const TRIGGER_EVENT_LABELS: Record<TriggerEvent, string> = {
  lead_created: 'Lead creado',
  lead_stage_changed: 'Cambia de etapa',
  lead_lost: 'Lead perdido',
  lead_won: 'Lead ganado',
  lead_stalled: 'Lead estancado',
  linkedin_message: 'Recibe mensaje',
  linkedin_reply: 'Responde mensaje',
  linkedin_connection: 'Acepta conexión',
  facebook_comment: 'Comenta publicación',
  facebook_message: 'Envía mensaje',
  facebook_like: 'Da like a publicación',
  stage_duration_exceeded: 'Supera días en etapa',
  inactivity_days: 'Días sin actividad',
};

export const TRIGGER_SOURCE_LABELS: Record<TriggerSource, string> = {
  crm: 'CRM',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  time: 'Tiempo',
};

export const TRIGGERS_BY_SOURCE: Record<TriggerSource, TriggerEvent[]> = {
  crm: ['lead_created', 'lead_stage_changed', 'lead_lost', 'lead_won', 'lead_stalled'],
  linkedin: ['linkedin_message', 'linkedin_reply', 'linkedin_connection'],
  facebook: ['facebook_comment', 'facebook_message', 'facebook_like'],
  time: ['stage_duration_exceeded', 'inactivity_days'],
};

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'not_exists';

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'igual a',
  not_equals: 'distinto de',
  contains: 'contiene',
  not_contains: 'no contiene',
  gt: 'mayor que',
  gte: 'mayor o igual',
  lt: 'menor que',
  lte: 'menor o igual',
  exists: 'existe',
  not_exists: 'no existe',
};

export interface RuleCondition {
  uid: string;
  field: string;
  operator: ConditionOperator;
  value: string | number;
}

export interface ConditionGroup {
  uid: string;
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
}

export type ActionType =
  | 'create_lead'
  | 'assign_owner'
  | 'create_activity'
  | 'update_field'
  | 'send_notification'
  | 'apply_tag';

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  create_lead: 'Crear Lead',
  assign_owner: 'Asignar propietario',
  create_activity: 'Crear actividad',
  update_field: 'Actualizar campo',
  send_notification: 'Enviar notificación',
  apply_tag: 'Aplicar etiqueta',
};

export interface AutomationAction {
  uid: string;
  sequence: number;
  type: ActionType;
  config: {
    assignment_rule_id?: string;
    activity_type?: string;
    activity_notes?: string;
    field_name?: string;
    field_value?: string | number;
    notification_message?: string;
    notify_user_id?: string;
    tag?: string;
  };
}

export interface AutomationRule {
  uid: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger_source: TriggerSource;
  trigger_event: TriggerEvent;
  trigger_config?: {
    days_threshold?: number;
    stage_id?: string;
  };
  condition_groups: ConditionGroup[];
  actions: AutomationAction[];
  run_count: number;
  last_run_at?: string;
  created_at: string;
}

export type AssignmentRuleType = 'round_robin' | 'geographic' | 'manual';

export const ASSIGNMENT_RULE_TYPE_LABELS: Record<AssignmentRuleType, string> = {
  round_robin: 'Round Robin',
  geographic: 'Geográfico',
  manual: 'Manual',
};

export interface AssignmentRule {
  uid: string;
  name: string;
  type: AssignmentRuleType;
  enabled: boolean;
  description?: string;
  user_ids: string[];
  geo_mapping?: Record<string, string[]>;
  round_robin_index: number;
  created_at: string;
}

export type ValidationStatus = 'unvalidated' | 'validated' | 'review_required';

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  unvalidated: 'Sin validar',
  validated: 'Validado',
  review_required: 'En revisión',
};

export interface LinkedInProfile {
  url: string;
  title?: string;
  company?: string;
  location?: string;
  validation_score: number;
  validation_status: ValidationStatus;
  last_checked?: string;
}
