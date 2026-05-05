'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryWarehouseService } from 'src/features/inventory/services/inventory-warehouse.service';
import type {
  CreateWarehousePayload,
  Warehouse,
  WarehouseListSummary,
} from 'src/features/inventory/types/inventory.types';
import { queryKeys } from 'src/lib/query-keys';

const EMPTY_SUMMARY: WarehouseListSummary = { total_warehouses: 0, active_warehouses: 0 };

export function useWarehouses() {
  const queryClient = useQueryClient();

  const { data: result } = useQuery({
    queryKey: queryKeys.inventory.warehouses,
    queryFn: () => inventoryWarehouseService.list(),
  });

  const items: Warehouse[] = result?.data ?? [];
  const summary: WarehouseListSummary = { ...EMPTY_SUMMARY, ...result?.summary };
  const isLoading = !result;

  const createMutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) => inventoryWarehouseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.warehouses });
      toast.success('Bodega creada');
    },
    onError: () => toast.error('Error al crear bodega'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CreateWarehousePayload> }) =>
      inventoryWarehouseService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.warehouses });
      toast.success('Bodega actualizada');
    },
    onError: () => toast.error('Error al actualizar bodega'),
  });

  const removeMutation = useMutation({
    mutationFn: (uid: string) => inventoryWarehouseService.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.warehouses });
      toast.success('Bodega eliminada');
    },
    onError: () => toast.error('Error al eliminar bodega'),
  });

  return {
    items,
    summary,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.warehouses }),
    createWarehouse: (payload: CreateWarehousePayload) => createMutation.mutateAsync(payload),
    updateWarehouse: (uid: string, payload: Partial<CreateWarehousePayload>) =>
      updateMutation.mutateAsync({ uid, payload }),
    removeWarehouse: (uid: string) => removeMutation.mutateAsync(uid),
  };
}
