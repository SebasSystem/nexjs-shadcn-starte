export type CommissionType = 'VENTA' | 'MARGEN' | 'META';
export type PlanStatus = 'ACTIVO' | 'INACTIVO';

export interface CommissionTier {
  uid: string;
  threshold: number;
  percent: number;
}

export interface CommissionPlan {
  uid: string;
  name: string;
  type: CommissionType;
  base_percentage: number;
  tiers: CommissionTier[];
  applicable_roles: string[];
  start_date: string;
  end_date?: string;
  status: PlanStatus;
}

export type AssignmentStatus = 'ACTIVO' | 'INACTIVO' | 'SIN_ASIGNAR';

export interface CommissionAssignment {
  uid: string;
  user_uid: string;
  user_name: string;
  user_avatar?: string;
  team_uid: string;
  team_name: string;
  plan_uid?: string;
  plan_name?: string;
  plan_type?: CommissionType;
  start_date?: string;
  end_date?: string;
  status: AssignmentStatus;
}

export type CommissionRunStatus = 'PENDING' | 'APPROVED' | 'PAID';

export interface CommissionRun {
  uid: string;
  user_uid: string;
  user_name: string;
  user_avatar?: string;
  team_uid: string;
  period: string;
  total_sales: number;
  plan_applied: string;
  calculated_commission: number;
  status: CommissionRunStatus;
}

// ─── Targets ────────────────────────────────────────────────────────────────

export interface CommissionTarget {
  uid: string;
  user_uid: string;
  user_name: string;
  metric: string;
  goal_value: number;
  current_value: number;
  period: string;
  created_at: string;
}

export interface CreateTargetPayload {
  user_uid: string;
  metric: string;
  goal_value: number;
  period: string;
}

// ─── Rules ──────────────────────────────────────────────────────────────────

export interface CommissionRule {
  uid: string;
  name: string;
  description: string;
  rule_type: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface CreateRulePayload {
  name: string;
  description: string;
  rule_type: string;
  config: Record<string, unknown>;
  is_active?: boolean;
}

export interface UpdateRulePayload {
  name?: string;
  description?: string;
  rule_type?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

// ─── Entries ────────────────────────────────────────────────────────────────

export type CommissionEntryStatus = 'pending' | 'paid';

export interface CommissionEntry {
  uid: string;
  run_uid: string;
  user_uid: string;
  user_name: string;
  commission_amount: number;
  status: CommissionEntryStatus;
  created_at: string;
}

// ─── Financial Records ──────────────────────────────────────────────────────

export interface CommissionFinancialRecord {
  uid: string;
  type: string;
  amount: number;
  description: string;
  recorded_at: string;
}

export interface CreateFinancialRecordPayload {
  type: string;
  amount: number;
  description: string;
  recorded_at?: string;
}

// ─── Runs Create ────────────────────────────────────────────────────────────

export interface CreateRunPayload {
  user_uid: string;
  period: string;
  total_sales: number;
}
