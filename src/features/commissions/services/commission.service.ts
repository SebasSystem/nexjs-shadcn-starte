import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

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
  SimulatePayload,
  SimulateResult,
  UpdateRulePayload,
} from '../types/commissions.types';

export interface DashboardKPIs {
  monthly_target: number;
  sales_achieved: number;
  projected_commission: number;
  liquidated_commission: number;
}

export interface TierProgress {
  uid: string;
  name: string;
  range_text: string;
  percent: number;
  completed: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  amount_achieved: number;
  amount_target: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  tiers: TierProgress[];
  recentSales: {
    uid: string;
    date: string;
    client: string;
    amount: number;
    commission_generated: number;
  }[];
}

export const commissionService = {
  // ── Runs ──────────────────────────────────────────────────────────────────

  async getRuns(params?: PaginationParams): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.commissions.runs.list, { params });
    return res.data;
  },

  async createRun(payload: CreateRunPayload): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.create, payload);
    return (res.data?.data ?? res.data) as CommissionRun;
  },

  async approveRun(uid: string): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.approve(uid));
    return (res.data?.data ?? res.data) as CommissionRun;
  },

  async payRun(uid: string, paidAt: string): Promise<CommissionRun> {
    const res = await axiosInstance.post(endpoints.commissions.runs.pay(uid), {
      paid_at: paidAt,
    });
    return (res.data?.data ?? res.data) as CommissionRun;
  },

  // ── Simulate ──────────────────────────────────────────────────────────────

  async simulate(payload: SimulatePayload): Promise<SimulateResult> {
    const res = await axiosInstance.post(endpoints.commissions.simulate, payload);
    return res.data?.data ?? res.data;
  },

  // ── Periods ────────────────────────────────────────────────────────────────

  async getPeriods(): Promise<string[]> {
    const res = await axiosInstance.get(endpoints.commissions.periods);
    return (res.data?.data ?? res.data) as string[];
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard(userUid: string): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.commissions.dashboard(userUid));
    return (res.data?.data ?? res.data) as DashboardData;
  },

  async getMySummary(): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.commissions.mySummary);
    return (res.data?.data ?? res.data) as DashboardData;
  },

  // ── Targets ───────────────────────────────────────────────────────────────

  targets: {
    async list(params?: PaginationParams): Promise<unknown> {
      const res = await axiosInstance.get(endpoints.commissions.targets.list, { params });
      return res.data;
    },

    async create(payload: CreateTargetPayload): Promise<CommissionTarget> {
      const res = await axiosInstance.post(endpoints.commissions.targets.create, payload);
      return (res.data?.data ?? res.data) as CommissionTarget;
    },

    async get(uid: string): Promise<CommissionTarget> {
      const res = await axiosInstance.get(endpoints.commissions.targets.targetDetail(uid));
      return (res.data?.data ?? res.data) as CommissionTarget;
    },

    async update(uid: string, payload: Partial<CreateTargetPayload>): Promise<CommissionTarget> {
      const res = await axiosInstance.put(endpoints.commissions.targets.targetDetail(uid), payload);
      return (res.data?.data ?? res.data) as CommissionTarget;
    },

    async remove(uid: string): Promise<void> {
      await axiosInstance.delete(endpoints.commissions.targets.targetDetail(uid));
    },
  },

  // ── Rules ─────────────────────────────────────────────────────────────────

  rules: {
    async list(params?: PaginationParams): Promise<unknown> {
      const res = await axiosInstance.get(endpoints.commissions.rules.list, { params });
      return res.data;
    },

    async create(payload: CreateRulePayload): Promise<CommissionRule> {
      const res = await axiosInstance.post(endpoints.commissions.rules.create, payload);
      return (res.data?.data ?? res.data) as CommissionRule;
    },

    async update(uid: string, payload: UpdateRulePayload): Promise<CommissionRule> {
      const res = await axiosInstance.put(endpoints.commissions.rules.update(uid), payload);
      return (res.data?.data ?? res.data) as CommissionRule;
    },

    async remove(uid: string): Promise<void> {
      await axiosInstance.delete(endpoints.commissions.rules.delete(uid));
    },
  },

  // ── Entries ───────────────────────────────────────────────────────────────

  entries: {
    async list(params?: PaginationParams): Promise<unknown> {
      const res = await axiosInstance.get(endpoints.commissions.entries.list, { params });
      return res.data;
    },

    async pay(uid: string): Promise<CommissionEntry> {
      const res = await axiosInstance.put(endpoints.commissions.entries.pay(uid));
      return (res.data?.data ?? res.data) as CommissionEntry;
    },
  },

  // ── Financial Records ─────────────────────────────────────────────────────

  financialRecords: {
    async create(payload: CreateFinancialRecordPayload): Promise<CommissionFinancialRecord> {
      const res = await axiosInstance.post(endpoints.commissions.financialRecords.create, payload);
      return (res.data?.data ?? res.data) as CommissionFinancialRecord;
    },
  },
};
