import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { AutomationRule } from '../types';

export const automationService = {
  async getTriggerEvents(): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.automation.triggerEvents);
    return res.data?.data ?? res.data;
  },

  async getAll(params?: PaginationParams): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.automation.rules.list, { params });
    return res.data;
  },

  async getById(uid: string): Promise<AutomationRule> {
    const res = await axiosInstance.get(endpoints.automation.rules.detail(uid));
    return res.data?.data ?? res.data;
  },

  async create(
    data: Omit<AutomationRule, 'uid' | 'created_at' | 'execution_count' | 'last_executed_at'>
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

  async toggleRule(uid: string): Promise<AutomationRule> {
    const res = await axiosInstance.post(endpoints.automation.rules.toggle(uid));
    return res.data?.data ?? res.data;
  },
  async getActions(): Promise<{ value: string; label: string }[]> {
    const res = await axiosInstance.get(endpoints.automation.actions);
    return (res.data?.data ?? []) as { value: string; label: string }[];
  },
};
