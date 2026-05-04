import type {
  CreateWarehousePayload,
  InventoryMasterItem,
  Warehouse,
  WarehouseListSummary,
} from 'src/features/inventory/types/inventory.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const inventoryWarehouseService = {
  async list(): Promise<{ data: Warehouse[]; summary: WarehouseListSummary }> {
    const res = await axiosInstance.get(endpoints.inventory.warehouses);
    return { data: res.data.data, summary: res.data.summary ?? {} };
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
