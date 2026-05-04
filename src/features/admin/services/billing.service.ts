import type { Factura } from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const billingService = {
  async getAll(): Promise<Factura[]> {
    const res = await axiosInstance.get(endpoints.admin.billing.list);
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
