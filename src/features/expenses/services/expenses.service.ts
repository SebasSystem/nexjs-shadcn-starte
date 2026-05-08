import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  CategoryPayload,
  CostCenter,
  CostCenterPayload,
  Expense,
  ExpenseCategory,
  ExpensePayload,
  Supplier,
  SupplierPayload,
} from '../types/expenses.types';

export const expensesService = {
  // ─── Expense Categories ───────────────────────────────────────────────
  async listCategories(): Promise<ExpenseCategory[]> {
    const res = await axiosInstance.get(endpoints.expenses.categories);
    return res.data.data;
  },
  async createCategory(payload: CategoryPayload): Promise<ExpenseCategory> {
    const res = await axiosInstance.post(endpoints.expenses.categories, payload);
    return res.data.data;
  },
  async updateCategory(uid: string, payload: Partial<CategoryPayload>): Promise<ExpenseCategory> {
    const res = await axiosInstance.put(`${endpoints.expenses.categories}/${uid}`, payload);
    return res.data.data;
  },
  async deleteCategory(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.categories}/${uid}`);
  },

  // ─── Suppliers ────────────────────────────────────────────────────────
  async listSuppliers(): Promise<Supplier[]> {
    const res = await axiosInstance.get(endpoints.expenses.suppliers);
    return res.data.data;
  },
  async createSupplier(payload: SupplierPayload): Promise<Supplier> {
    const res = await axiosInstance.post(endpoints.expenses.suppliers, payload);
    return res.data.data;
  },
  async updateSupplier(uid: string, payload: Partial<SupplierPayload>): Promise<Supplier> {
    const res = await axiosInstance.put(`${endpoints.expenses.suppliers}/${uid}`, payload);
    return res.data.data;
  },
  async deleteSupplier(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.suppliers}/${uid}`);
  },

  // ─── Cost Centers ─────────────────────────────────────────────────────
  async listCostCenters(): Promise<CostCenter[]> {
    const res = await axiosInstance.get(endpoints.expenses.costCenters);
    return res.data.data;
  },
  async createCostCenter(payload: CostCenterPayload): Promise<CostCenter> {
    const res = await axiosInstance.post(endpoints.expenses.costCenters, payload);
    return res.data.data;
  },
  async updateCostCenter(uid: string, payload: Partial<CostCenterPayload>): Promise<CostCenter> {
    const res = await axiosInstance.put(`${endpoints.expenses.costCenters}/${uid}`, payload);
    return res.data.data;
  },
  async deleteCostCenter(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.costCenters}/${uid}`);
  },

  // ─── Expenses ─────────────────────────────────────────────────────────
  async list(): Promise<{ data: Expense[] }> {
    const res = await axiosInstance.get(endpoints.expenses.list);
    return res.data;
  },
  async create(payload: ExpensePayload): Promise<Expense> {
    const res = await axiosInstance.post(endpoints.expenses.list, payload);
    return res.data.data;
  },
  async update(uid: string, payload: Partial<ExpensePayload>): Promise<Expense> {
    const res = await axiosInstance.put(`${endpoints.expenses.list}/${uid}`, payload);
    return res.data.data;
  },
  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.expenses.list}/${uid}`);
  },
};
