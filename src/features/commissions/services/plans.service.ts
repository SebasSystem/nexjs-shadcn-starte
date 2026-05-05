import axiosInstance, { endpoints } from 'src/lib/axios';

import type { CommissionPlan, CommissionTier } from '../types/commissions.types';

function mapTier(raw: Record<string, unknown>): CommissionTier {
  return {
    uid: (raw.uid as string) ?? String(raw.threshold),
    threshold: raw.threshold as number,
    percentage: raw.percent as number,
  };
}

function mapPlan(raw: Record<string, unknown>): CommissionPlan {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    type: raw.type as CommissionPlan['type'],
    base_percentage: raw.base_percentage as number,
    tiers: ((raw.tiers_json ?? raw.tiers) as Record<string, unknown>[]).map(mapTier),
    applicable_roles: (raw.applicable_roles as string[]) ?? [],
    start_date: raw.start_date as string,
    end_date: raw.end_date as string | undefined,
    status: raw.status as CommissionPlan['status'],
  };
}

export interface CreatePlanPayload {
  name: string;
  type: string;
  base_percentage: number;
  tiers: { threshold: number; percent: number }[];
  applicable_roles: string[];
  start_date: string;
  end_date?: string;
  status?: string;
}

export interface UpdatePlanPayload {
  name?: string;
  type?: string;
  base_percentage?: number;
  tiers?: { threshold: number; percent: number }[];
  applicable_roles?: string[];
  start_date?: string;
  end_date?: string;
  status?: string;
}

export const plansService = {
  async getPlans(): Promise<CommissionPlan[]> {
    const res = await axiosInstance.get(endpoints.commissions.plans.list);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapPlan);
  },

  async getPlanById(uid: string): Promise<CommissionPlan> {
    const res = await axiosInstance.get(endpoints.commissions.plans.update(uid));
    return mapPlan(res.data?.data ?? res.data);
  },

  async createPlan(data: CreatePlanPayload): Promise<CommissionPlan> {
    const res = await axiosInstance.post(endpoints.commissions.plans.create, data);
    return mapPlan(res.data?.data ?? res.data);
  },

  async updatePlan(uid: string, data: UpdatePlanPayload): Promise<CommissionPlan> {
    const res = await axiosInstance.put(endpoints.commissions.plans.update(uid), data);
    return mapPlan(res.data?.data ?? res.data);
  },

  async deletePlan(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.commissions.plans.update(uid));
  },
};
