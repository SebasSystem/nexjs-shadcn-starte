import type {
  DashboardCoreData,
  RecentActivity,
} from 'src/features/dashboard/types/dashboard.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const dashboardService = {
  async getCore(): Promise<DashboardCoreData> {
    const res = await axiosInstance.get(endpoints.dashboard.core);
    return res.data.data;
  },

  async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
    const res = await axiosInstance.get('/activities', {
      params: { per_page: limit, paginate: false },
    });
    return res.data.data;
  },
};
