import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { PurchaseOrder, PurchaseOrderPayload } from '../types/purchase-order.types';

export interface ListPurchaseOrdersParams extends PaginationParams {
  /** Backend-supported: filters by purchase order status.
   *  Valid values (backend): draft, approved, partial_received, received,
   *  cancelled, partial_paid, paid, overdue.
   *  Search is also backend-supported via the `search` field (inherited from PaginationParams). */
  status?: string;
}

export const purchaseOrderService = {
  async list(
    params?: ListPurchaseOrdersParams
  ): Promise<{ data: PurchaseOrder[]; meta?: unknown }> {
    const res = await axiosInstance.get(endpoints.purchases.list, { params });
    return res.data;
  },
  async get(uid: string): Promise<PurchaseOrder> {
    const res = await axiosInstance.get(endpoints.purchases.detail(uid));
    return res.data.data;
  },
  async create(payload: PurchaseOrderPayload): Promise<PurchaseOrder> {
    const res = await axiosInstance.post(endpoints.purchases.create, payload);
    return res.data.data;
  },
  async update(uid: string, payload: Partial<PurchaseOrderPayload>): Promise<PurchaseOrder> {
    const res = await axiosInstance.put(endpoints.purchases.update(uid), payload);
    return res.data.data;
  },
  async approve(uid: string): Promise<void> {
    await axiosInstance.post(endpoints.purchases.approve(uid));
  },
  async markReceived(uid: string): Promise<void> {
    await axiosInstance.post(endpoints.purchases.receive(uid));
  },
};
