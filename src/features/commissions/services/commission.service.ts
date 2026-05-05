import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  CommissionEntry,
  CommissionFinancialRecord,
  CommissionRule,
  CommissionRun,
  CommissionTarget,
  CreateFinancialRecordPayload,
  CreateRulePayload,
  CreateRunPayload,
  CreateTargetPayload,
  UpdateRulePayload,
} from '../types/commissions.types';

function mapRun(raw: Record<string, unknown>): CommissionRun {
  return {
    uid: raw.uid as string,
    user_uid: raw.user_uid as string,
    user_name: raw.user_name as string,
    user_avatar: raw.user_avatar as string | undefined,
    team_uid: raw.team_uid as string,
    period: raw.period as string,
    total_sales: raw.total_sales as number,
    plan_applied: raw.plan_applied as string,
    calculated_commission: raw.calculated_commission as number,
    status: raw.status as CommissionRun['status'],
  };
}

function mapTarget(raw: Record<string, unknown>): CommissionTarget {
  return {
    uid: raw.uid as string,
    user_uid: raw.user_uid as string,
    user_name: raw.user_name as string,
    metric: raw.metric as string,
    goal_value: raw.goal_value as number,
    current_value: raw.current_value as number,
    period: raw.period as string,
    created_at: raw.created_at as string,
  };
}

function mapRule(raw: Record<string, unknown>): CommissionRule {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    description: raw.description as string,
    rule_type: raw.rule_type as string,
    config: (raw.config as Record<string, unknown>) ?? {},
    is_active: (raw.is_active as boolean) ?? true,
    created_at: raw.created_at as string,
  };
}

function mapEntry(raw: Record<string, unknown>): CommissionEntry {
  return {
    uid: raw.uid as string,
    run_uid: raw.run_uid as string,
    user_uid: raw.user_uid as string,
    user_name: raw.user_name as string,
    commission_amount: raw.commission_amount as number,
    status: raw.status as CommissionEntry['status'],
    created_at: raw.created_at as string,
  };
}

function mapFinancialRecord(raw: Record<string, unknown>): CommissionFinancialRecord {
  return {
    uid: raw.uid as string,
    type: raw.type as string,
    amount: raw.amount as number,
    description: raw.description as string,
    recorded_at: raw.recorded_at as string,
  };
}

export interface SimulatePayload {
  plan_uid: string;
  accumulated_sales: number;
  hypothetical_sale: number;
}

export interface SimulateBreakdownItem {
  tierInfo: string;
  rangeText: string;
  percent: number;
  amountInTier: number;
  commissionGenerated: number;
}

export interface SimulateResult {
  breakdown: SimulateBreakdownItem[];
  total: number;
}

export interface DashboardKPIs {
  monthlyTarget: number;
  achievedSales: number;
  projectedCommission: number;
  liquidatedCommission: number;
}

export interface TierProgress {
  uid: string;
  name: string;
  rangeText: string;
  percent: number;
  completed: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  amountAchieved: number;
  amountTarget: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  tiers: TierProgress[];
  recentSales: {
    uid: string;
    date: string;
    client: string;
    amount: number;
    commissionGenerated: number;
  }[];
}

function mapDashboard(raw: Record<string, unknown>): DashboardData {
  const kpisRaw = (raw.kpis ?? raw) as Record<string, unknown>;
  const tiersRaw = (raw.tiers_progress ?? raw.tiers ?? []) as Record<string, unknown>[];
  const salesRaw = (raw.recent_sales ?? raw.sales ?? []) as Record<string, unknown>[];
  return {
    kpis: {
      monthlyTarget: kpisRaw.monthly_target as number,
      achievedSales: kpisRaw.achieved_sales as number,
      projectedCommission: kpisRaw.projected_commission as number,
      liquidatedCommission: kpisRaw.liquidated_commission as number,
    },
    tiers: tiersRaw.map((t: Record<string, unknown>) => ({
      uid: t.uid as string,
      name: t.name as string,
      rangeText: t.range_text as string,
      percent: t.percent as number,
      completed: t.completed as number,
      status: t.status as TierProgress['status'],
      amountAchieved: t.amount_achieved as number,
      amountTarget: t.amount_target as number,
    })),
    recentSales: salesRaw.map((s: Record<string, unknown>) => ({
      uid: s.uid as string,
      date: s.date as string,
      client: s.client as string,
      amount: s.amount as number,
      commissionGenerated: s.commission_generated as number,
    })),
  };
}

export const commissionService = {
  // ── Runs ──────────────────────────────────────────────────────────────────

  async getRuns(): Promise<CommissionRun[]> {
    const res = await axiosInstance.get(endpoints.commissions.runs.list);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapRun);
  },

  async createRun(payload: CreateRunPayload): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.create, payload);
    return mapRun(res.data?.data ?? res.data);
  },

  async approveRun(uid: string): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.approve(uid));
    return mapRun(res.data?.data ?? res.data);
  },

  async payRun(uid: string, paidAt?: string): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.pay(uid), {
      paid_at: paidAt ?? new Date().toISOString().split('T')[0],
    });
    return mapRun(res.data?.data ?? res.data);
  },

  // ── Simulate ──────────────────────────────────────────────────────────────

  async simulate(payload: SimulatePayload): Promise<SimulateResult> {
    const res = await axiosInstance.post(endpoints.commissions.simulate, payload);
    return res.data?.data ?? res.data;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard(userUid: string): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.commissions.dashboard(userUid));
    return mapDashboard(res.data?.data ?? res.data);
  },

  async getMySummary(): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.commissions.mySummary);
    return mapDashboard(res.data?.data ?? res.data);
  },

  // ── Targets ───────────────────────────────────────────────────────────────

  targets: {
    async list(): Promise<CommissionTarget[]> {
      const res = await axiosInstance.get(endpoints.commissions.targets.list);
      const payload = res.data?.data ?? res.data;
      return (Array.isArray(payload) ? payload : []).map(mapTarget);
    },

    async create(payload: CreateTargetPayload): Promise<CommissionTarget> {
      const res = await axiosInstance.post(endpoints.commissions.targets.create, payload);
      return mapTarget(res.data?.data ?? res.data);
    },
  },

  // ── Rules ─────────────────────────────────────────────────────────────────

  rules: {
    async list(): Promise<CommissionRule[]> {
      const res = await axiosInstance.get(endpoints.commissions.rules.list);
      const payload = res.data?.data ?? res.data;
      return (Array.isArray(payload) ? payload : []).map(mapRule);
    },

    async create(payload: CreateRulePayload): Promise<CommissionRule> {
      const res = await axiosInstance.post(endpoints.commissions.rules.create, payload);
      return mapRule(res.data?.data ?? res.data);
    },

    async update(uid: string, payload: UpdateRulePayload): Promise<CommissionRule> {
      const res = await axiosInstance.put(endpoints.commissions.rules.update(uid), payload);
      return mapRule(res.data?.data ?? res.data);
    },

    async remove(uid: string): Promise<void> {
      await axiosInstance.delete(endpoints.commissions.rules.delete(uid));
    },
  },

  // ── Entries ───────────────────────────────────────────────────────────────

  entries: {
    async list(): Promise<CommissionEntry[]> {
      const res = await axiosInstance.get(endpoints.commissions.entries.list);
      const payload = res.data?.data ?? res.data;
      return (Array.isArray(payload) ? payload : []).map(mapEntry);
    },

    async pay(uid: string): Promise<CommissionEntry> {
      const res = await axiosInstance.put(endpoints.commissions.entries.pay(uid));
      return mapEntry(res.data?.data ?? res.data);
    },
  },

  // ── Financial Records ─────────────────────────────────────────────────────

  financialRecords: {
    async create(payload: CreateFinancialRecordPayload): Promise<CommissionFinancialRecord> {
      const res = await axiosInstance.post(endpoints.commissions.financialRecords.create, payload);
      return mapFinancialRecord(res.data?.data ?? res.data);
    },
  },
};
