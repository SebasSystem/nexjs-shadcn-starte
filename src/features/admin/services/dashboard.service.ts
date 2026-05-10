import type { DashboardData } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m';

export const dashboardService = {
  async get(period?: DashboardPeriod): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.admin.dashboard, {
      params: period ? { period } : undefined,
    });
    return res.data.data;
  },
};
