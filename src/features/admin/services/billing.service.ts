import type { BillingSummary, Factura } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export interface BillingFilters {
  estado?: string;
  from?: string;
  to?: string;
  search?: string;
  plan_uid?: string;
  page?: number;
  per_page?: number;
}

export const billingService = {
  async getAll(params?: BillingFilters): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.admin.billing.list, { params });
    return res.data;
  },
  async getSummary(): Promise<BillingSummary> {
    const res = await axiosInstance.get(endpoints.admin.billing.summary);
    return res.data.data;
  },
  async marcarPagada(uid: string): Promise<Factura> {
    const res = await axiosInstance.post(endpoints.admin.billing.markPaid(uid));
    return res.data.data;
  },
  async marcarPagadas(uids: string[]): Promise<Factura[]> {
    const res = await axiosInstance.post(endpoints.admin.billing.markPaidBulk, { ids: uids });
    return res.data.data;
  },
};
