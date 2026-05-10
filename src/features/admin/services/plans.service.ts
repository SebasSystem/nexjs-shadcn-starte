import type { PlanPayload, PlanSaaS } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const plansService = {
  async getModules(): Promise<{ key: string; label: string }[]> {
    const res = await axiosInstance.get(endpoints.admin.planModules);
    return res.data.data ?? res.data;
  },
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
  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.plans.delete(uid));
  },
};
