'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { expensesService } from '../services/expenses.service';
import type {
  CategoryPayload,
  CostCenterPayload,
  ExpensePayload,
  SupplierPayload,
} from '../types/expenses.types';

const KEYS = {
  categories: ['expenses', 'categories'] as const,
  suppliers: ['expenses', 'suppliers'] as const,
  costCenters: ['expenses', 'cost-centers'] as const,
  expenses: ['expenses', 'list'] as const,
};

// ─── Categories ─────────────────────────────────────────────────────────────

export function useExpenseCategories(search?: string) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: [...KEYS.categories, search],
    queryFn: async () => {
      const res = await expensesService.listCategories(search ? { search } : undefined);
      return ((res as Record<string, unknown>).data ??
        []) as import('../types/expenses.types').ExpenseCategory[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const create = useMutation({
    mutationFn: (p: CategoryPayload) =>
      expensesService.createCategory(p) as Promise<
        import('../types/expenses.types').ExpenseCategory
      >,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.categories });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear categoría'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CategoryPayload> }) =>
      expensesService.updateCategory(uid, payload) as Promise<
        import('../types/expenses.types').ExpenseCategory
      >,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.categories });
      toast.success('Categoría actualizada');
    },
    onError: () => toast.error('Error al actualizar'),
  });
  const remove = useMutation({
    mutationFn: (uid: string) => expensesService.deleteCategory(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.categories });
      toast.success('Categoría eliminada');
    },
    onError: () => toast.error('Error al eliminar'),
  });
  return {
    categories: data,
    isLoading,
    createCategory: create,
    updateCategory: update,
    deleteCategory: remove,
  };
}

// ─── Suppliers ──────────────────────────────────────────────────────────────

export function useSuppliers(search?: string) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: [...KEYS.suppliers, search],
    queryFn: async () => {
      const res = await expensesService.listSuppliers(search ? { search } : undefined);
      return ((res as Record<string, unknown>).data ??
        []) as import('../types/expenses.types').Supplier[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const create = useMutation({
    mutationFn: (p: SupplierPayload) =>
      expensesService.createSupplier(p) as Promise<import('../types/expenses.types').Supplier>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.suppliers });
      toast.success('Proveedor creado');
    },
    onError: () => toast.error('Error al crear proveedor'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<SupplierPayload> }) =>
      expensesService.updateSupplier(uid, payload) as Promise<
        import('../types/expenses.types').Supplier
      >,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.suppliers });
      toast.success('Proveedor actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });
  const remove = useMutation({
    mutationFn: (uid: string) => expensesService.deleteSupplier(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.suppliers });
      toast.success('Proveedor eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });
  return {
    suppliers: data,
    isLoading,
    createSupplier: create,
    updateSupplier: update,
    deleteSupplier: remove,
  };
}

// ─── Cost Centers ───────────────────────────────────────────────────────────

export function useCostCenters(search?: string) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: [...KEYS.costCenters, search],
    queryFn: async () => {
      const res = await expensesService.listCostCenters(search ? { search } : undefined);
      return ((res as Record<string, unknown>).data ??
        []) as import('../types/expenses.types').CostCenter[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const create = useMutation({
    mutationFn: (p: CostCenterPayload) =>
      expensesService.createCostCenter(p) as Promise<import('../types/expenses.types').CostCenter>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.costCenters });
      toast.success('Centro de costo creado');
    },
    onError: () => toast.error('Error al crear'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CostCenterPayload> }) =>
      expensesService.updateCostCenter(uid, payload) as Promise<
        import('../types/expenses.types').CostCenter
      >,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.costCenters });
      toast.success('Centro de costo actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });
  const remove = useMutation({
    mutationFn: (uid: string) => expensesService.deleteCostCenter(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.costCenters });
      toast.success('Centro de costo eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });
  return {
    costCenters: data,
    isLoading,
    createCostCenter: create,
    updateCostCenter: update,
    deleteCostCenter: remove,
  };
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export function useExpenses(
  filters: {
    status?: string;
    category_uid?: string;
    supplier_uid?: string;
    cost_center_uid?: string;
  } = {}
) {
  const qc = useQueryClient();
  const pagination = usePaginationParams();

  const serverParams = {
    ...pagination.params,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category_uid ? { category_uid: filters.category_uid } : {}),
    ...(filters.supplier_uid ? { supplier_uid: filters.supplier_uid } : {}),
    ...(filters.cost_center_uid ? { cost_center_uid: filters.cost_center_uid } : {}),
  };

  const { data = [], isLoading } = useQuery({
    queryKey: [...KEYS.expenses, serverParams],
    queryFn: async () => {
      const res = await expensesService.list(serverParams);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ??
        []) as import('../types/expenses.types').Expense[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const create = useMutation({
    mutationFn: (p: ExpensePayload) =>
      expensesService.create(p) as Promise<import('../types/expenses.types').Expense>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.expenses });
      toast.success('Gasto registrado');
    },
    onError: () => toast.error('Error al registrar gasto'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<ExpensePayload> }) =>
      expensesService.update(uid, payload) as Promise<import('../types/expenses.types').Expense>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.expenses });
      toast.success('Gasto actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });
  const remove = useMutation({
    mutationFn: (uid: string) => expensesService.delete(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.expenses });
      toast.success('Gasto eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });
  return {
    expenses: data,
    isLoading,
    createExpense: create,
    updateExpense: update,
    deleteExpense: remove,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      search: pagination.search,
      onChangeSearch: pagination.onChangeSearch,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
