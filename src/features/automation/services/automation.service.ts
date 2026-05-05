import axiosInstance, { endpoints } from 'src/lib/axios';

import type { AutomationRule } from '../types';

export const automationService = {
  async getAll(): Promise<AutomationRule[]> {
    const res = await axiosInstance.get(endpoints.automation.rules.list);
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async getById(uid: string): Promise<AutomationRule> {
    const res = await axiosInstance.get(endpoints.automation.rules.detail(uid));
    return res.data?.data ?? res.data;
  },

  async create(
    data: Omit<AutomationRule, 'uid' | 'created_at' | 'run_count' | 'last_run_at'>
  ): Promise<AutomationRule> {
    const res = await axiosInstance.post(endpoints.automation.rules.create, data);
    return res.data?.data ?? res.data;
  },

  async update(uid: string, data: Partial<AutomationRule>): Promise<AutomationRule> {
    const res = await axiosInstance.put(endpoints.automation.rules.update(uid), data);
    return res.data?.data ?? res.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.automation.rules.delete(uid));
  },
};
