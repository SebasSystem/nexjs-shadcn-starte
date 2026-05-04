import type { PlanPayload, PlanSaaS } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const plansService = {
  async getAll(): Promise<PlanSaaS[]> {
    const res = await axiosInstance.get(endpoints.plans.list);
    return res.data.data;
  },
  async create(data: PlanPayload): Promise<PlanSaaS> {
    const res = await axiosInstance.post(endpoints.plans.create, data);
    return res.data.data;
  },
  async update(uid: string, data: Partial<PlanPayload>): Promise<PlanSaaS> {
    const res = await axiosInstance.put(endpoints.plans.update(uid), data);
    return res.data.data;
  },
};
