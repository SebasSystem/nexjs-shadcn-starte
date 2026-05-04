import type { DashboardData } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const res = await axiosInstance.get(endpoints.admin.dashboard);
    return res.data.data;
  },
};
