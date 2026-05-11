import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type {
  CategoryPayload,
  CostCenterPayload,
  ExpensePayload,
  SupplierPayload,
} from '../types/expenses.types';

export const expensesService = {
  // ─── Expense Categories ───────────────────────────────────────────────
  async listCategories(params?: { search?: string }): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.expenses.categories, { params });
    return res.data;
  },
  async createCategory(payload: CategoryPayload): Promise<unknown> {
    const res = await axiosInstance.post(endpoints.expenses.categories, payload);
    return res.data;
  },
  async updateCategory(uid: string, payload: Partial<CategoryPayload>): Promise<unknown> {
    const res = await axiosInstance.put(`${endpoints.expenses.categories}/${uid}`, payload);
    return res.data;
  },
  async deleteCategory(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.categories}/${uid}`);
  },

  // ─── Suppliers ────────────────────────────────────────────────────────
  async listSuppliers(params?: { search?: string }): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.expenses.suppliers, { params });
    return res.data;
  },
  async createSupplier(payload: SupplierPayload): Promise<unknown> {
    const res = await axiosInstance.post(endpoints.expenses.suppliers, payload);
    return res.data;
  },
  async updateSupplier(uid: string, payload: Partial<SupplierPayload>): Promise<unknown> {
    const res = await axiosInstance.put(`${endpoints.expenses.suppliers}/${uid}`, payload);
    return res.data;
  },
  async deleteSupplier(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.suppliers}/${uid}`);
  },

  // ─── Cost Centers ─────────────────────────────────────────────────────
  async listCostCenters(params?: { search?: string }): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.expenses.costCenters, { params });
    return res.data;
  },
  async createCostCenter(payload: CostCenterPayload): Promise<unknown> {
    const res = await axiosInstance.post(endpoints.expenses.costCenters, payload);
    return res.data;
  },
  async updateCostCenter(uid: string, payload: Partial<CostCenterPayload>): Promise<unknown> {
    const res = await axiosInstance.put(`${endpoints.expenses.costCenters}/${uid}`, payload);
    return res.data;
  },
  async deleteCostCenter(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.costCenters}/${uid}`);
  },

  // ─── Expenses ─────────────────────────────────────────────────────────
  async list(
    params?: PaginationParams & {
      search?: string;
      status?: string;
      category_uid?: string;
      supplier_uid?: string;
      cost_center_uid?: string;
    }
  ): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.expenses.list, { params });
    return res.data;
  },
  async create(payload: ExpensePayload): Promise<unknown> {
    const res = await axiosInstance.post(endpoints.expenses.list, payload);
    return res.data;
  },
  async update(uid: string, payload: Partial<ExpensePayload>): Promise<unknown> {
    const res = await axiosInstance.put(`${endpoints.expenses.list}/${uid}`, payload);
    return res.data;
  },
  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.list}/${uid}`);
  },
};
