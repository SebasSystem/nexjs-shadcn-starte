import axiosInstance, { endpoints } from 'src/lib/axios';

import type { CreditException, CreditRuleSettings } from '../types/sales.types';

export const financeService = {
  async getDashboard() {
    const res = await axiosInstance.get(endpoints.sales.financeDashboard);
    return res.data.data;
  },

  async getAlerts() {
    const res = await axiosInstance.get(endpoints.sales.financeAlerts);
    return res.data.data;
  },

  async getCreditSummary(type: string, uid: string) {
    const res = await axiosInstance.get(endpoints.sales.creditSummary(type, uid));
    return res.data.data;
  },

  async updateCreditProfile(type: string, uid: string, data: unknown) {
    const res = await axiosInstance.put(endpoints.sales.creditUpdate(type, uid), data);
    return res.data.data;
  },

  async getCreditRules(): Promise<CreditRuleSettings> {
    const res = await axiosInstance.get(endpoints.sales.creditRules);
    return res.data.data;
  },

  async saveCreditRules(data: CreditRuleSettings): Promise<void> {
    await axiosInstance.put(endpoints.sales.creditRules, data);
  },

  async listCreditExceptions(): Promise<CreditException[]> {
    const res = await axiosInstance.get(endpoints.sales.creditExceptions);
    return res.data.data ?? [];
  },

  async syncOverdue() {
    const res = await axiosInstance.post(endpoints.sales.financeSyncOverdue);
    return res.data.data;
  },
};
