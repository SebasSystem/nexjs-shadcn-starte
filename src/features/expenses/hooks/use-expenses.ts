'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

export function useExpenseCategories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEYS.categories,
    queryFn: () => expensesService.listCategories(),
  });
  const create = useMutation({
    mutationFn: (p: CategoryPayload) => expensesService.createCategory(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.categories });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear categoría'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CategoryPayload> }) =>
      expensesService.updateCategory(uid, payload),
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

export function useSuppliers() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEYS.suppliers,
    queryFn: () => expensesService.listSuppliers(),
  });
  const create = useMutation({
    mutationFn: (p: SupplierPayload) => expensesService.createSupplier(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.suppliers });
      toast.success('Proveedor creado');
    },
    onError: () => toast.error('Error al crear proveedor'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<SupplierPayload> }) =>
      expensesService.updateSupplier(uid, payload),
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

export function useCostCenters() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEYS.costCenters,
    queryFn: () => expensesService.listCostCenters(),
  });
  const create = useMutation({
    mutationFn: (p: CostCenterPayload) => expensesService.createCostCenter(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.costCenters });
      toast.success('Centro de costo creado');
    },
    onError: () => toast.error('Error al crear'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CostCenterPayload> }) =>
      expensesService.updateCostCenter(uid, payload),
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

export function useExpenses() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEYS.expenses,
    queryFn: async () => {
      const res = await expensesService.list();
      return (res.data ?? []) as import('../types/expenses.types').Expense[];
    },
  });
  const create = useMutation({
    mutationFn: (p: ExpensePayload) => expensesService.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.expenses });
      toast.success('Gasto registrado');
    },
    onError: () => toast.error('Error al registrar gasto'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<ExpensePayload> }) =>
      expensesService.update(uid, payload),
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
  };
}
