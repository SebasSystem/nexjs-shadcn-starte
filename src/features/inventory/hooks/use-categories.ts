'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import { queryKeys } from 'src/lib/query-keys';

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory.categories,
    queryFn: () => inventoryStockService.categories(),
  });

  const createCategory = useMutation({
    mutationFn: (payload: { name: string; key: string; description?: string }) =>
      inventoryStockService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear categoría'),
  });

  const updateCategory = useMutation({
    mutationFn: ({
      uid,
      payload,
    }: {
      uid: string;
      payload: { name?: string; key?: string; description?: string };
    }) => inventoryStockService.updateCategory(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
      toast.success('Categoría actualizada');
    },
    onError: () => toast.error('Error al actualizar categoría'),
  });

  const deleteCategory = useMutation({
    mutationFn: (uid: string) => inventoryStockService.deleteCategory(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
      toast.success('Categoría eliminada');
    },
    onError: () => toast.error('Error al eliminar categoría'),
  });

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
