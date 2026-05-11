import axiosInstance, { endpoints } from 'src/lib/axios';

// ─── Thin service — only raw API calls, no business logic ──────────────────

export const reportsService = {
  async getSalesReport(params: Record<string, unknown>) {
    const res = await axiosInstance.get(endpoints.reports.sales, { params });
    return res.data;
  },

  async getInventoryReport(params: Record<string, unknown>) {
    const res = await axiosInstance.get(endpoints.reports.inventory, { params });
    return res.data;
  },

  async getFilterOptions() {
    const res = await axiosInstance.get(endpoints.reports.filters);
    return res.data;
  },
};
