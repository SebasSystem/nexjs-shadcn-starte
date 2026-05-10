import type {
  CreateWarehousePayload,
  InventoryMasterItem,
  Warehouse,
  WarehouseListSummary,
} from 'src/features/inventory/types/inventory.types';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

export const inventoryWarehouseService = {
  async list(
    params?: PaginationParams
  ): Promise<{ data: Warehouse[]; summary: WarehouseListSummary }> {
    const res = await axiosInstance.get(endpoints.inventory.warehouses, { params });
    return { data: res.data.data, summary: res.data.summary ?? {} };
  },

  /** Returns full response with meta for pagination */
  async listRaw(params?: PaginationParams & { search?: string }): Promise<Record<string, unknown>> {
    const res = await axiosInstance.get(endpoints.inventory.warehouses, { params });
    return res.data;
  },

  async create(payload: CreateWarehousePayload): Promise<Warehouse> {
    const res = await axiosInstance.post(endpoints.inventory.warehouses, payload);
    return res.data.data;
  },

  async update(uid: string, payload: Partial<CreateWarehousePayload>): Promise<Warehouse> {
    const res = await axiosInstance.put(endpoints.inventory.warehouse(uid), payload);
    return res.data.data;
  },

  async remove(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.inventory.warehouse(uid));
  },

  async stocks(uid: string): Promise<{ warehouse: Warehouse; data: InventoryMasterItem[] }> {
    const res = await axiosInstance.get(endpoints.inventory.warehouseStocks(uid));
    return res.data.data;
  },
};
