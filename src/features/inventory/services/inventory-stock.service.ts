import type {
  AdjustStockPayload,
  InventoryCategory,
  InventoryMovement,
  MovementsSummary,
  TransferStockPayload,
} from 'src/features/inventory/types/inventory.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const inventoryStockService = {
  async movements(params?: {
    product_uid?: string;
    warehouse_uid?: string;
    type?: string;
  }): Promise<InventoryMovement[]> {
    const res = await axiosInstance.get(endpoints.inventory.movements, { params });
    return res.data.data;
  },

  async adjust(payload: AdjustStockPayload): Promise<void> {
    await axiosInstance.post(endpoints.inventory.adjust, payload);
  },

  async transfer(payload: TransferStockPayload): Promise<void> {
    await axiosInstance.post(endpoints.inventory.transfer, payload);
  },

  async categories(): Promise<InventoryCategory[]> {
    const res = await axiosInstance.get(endpoints.inventory.categories);
    return res.data.data;
  },

  async movementsSummary(): Promise<MovementsSummary> {
    const res = await axiosInstance.get(endpoints.inventory.movementsSummary);
    return res.data.data;
  },
};
