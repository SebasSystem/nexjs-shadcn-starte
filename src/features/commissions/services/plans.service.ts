import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { CommissionPlan } from '../types/commissions.types';

export interface CreatePlanPayload {
  name: string;
  type: 'sale' | 'margin' | 'target';
  base_percentage: number;
  tiers: { threshold: number; percent: number }[];
  role_uids: string[];
  starts_at: string;
  ends_at?: string;
}

export interface UpdatePlanPayload {
  name?: string;
  type?: 'sale' | 'margin' | 'target';
  base_percentage?: number;
  tiers?: { threshold: number; percent: number }[];
  role_uids?: string[];
  starts_at?: string;
  ends_at?: string;
  active?: boolean;
}

export const plansService = {
  async getPlans(params?: PaginationParams): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.commissions.plans.list, { params });
    return res.data;
  },

  async createPlan(data: CreatePlanPayload): Promise<CommissionPlan> {
    const res = await axiosInstance.post(endpoints.commissions.plans.create, data);
    return (res.data?.data ?? res.data) as CommissionPlan;
  },

  async updatePlan(uid: string, data: UpdatePlanPayload): Promise<CommissionPlan> {
    const res = await axiosInstance.put(endpoints.commissions.plans.update(uid), data);
    return (res.data?.data ?? res.data) as CommissionPlan;
  },

  async deletePlan(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.commissions.plans.update(uid));
  },
};
