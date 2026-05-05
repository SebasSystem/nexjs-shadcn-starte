'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import type {
  AdjustStockPayload,
  InventoryMovement,
  MovementsSummary,
  TransferStockPayload,
} from 'src/features/inventory/types/inventory.types';
import { queryKeys } from 'src/lib/query-keys';

const EMPTY_SUMMARY: MovementsSummary = { total: 0, entries: 0, transfers: 0, adjustments: 0 };

export function useMovements(filters?: {
  product_uid?: string;
  warehouse_uid?: string;
  type?: string;
}) {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: [...queryKeys.inventory.movements, filters],
    queryFn: async () => {
      const result = await inventoryStockService.movements(filters);
      return (Array.isArray(result) ? result : []) as InventoryMovement[];
    },
  });

  const { data: summary = EMPTY_SUMMARY } = useQuery({
    queryKey: queryKeys.inventory.movementsSummary,
    queryFn: () => inventoryStockService.movementsSummary(),
    placeholderData: EMPTY_SUMMARY,
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: AdjustStockPayload) => inventoryStockService.adjust(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movementsSummary });
      toast.success('Stock ajustado');
    },
    onError: () => toast.error('Error al ajustar stock'),
  });

  const transferMutation = useMutation({
    mutationFn: (payload: TransferStockPayload) => inventoryStockService.transfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movementsSummary });
      toast.success('Traslado realizado');
    },
    onError: () => toast.error('Error al trasladar stock'),
  });

  return {
    items,
    summary,
    isLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movementsSummary });
    },
    adjust: (payload: AdjustStockPayload) => adjustMutation.mutateAsync(payload),
    transfer: (payload: TransferStockPayload) => transferMutation.mutateAsync(payload),
  };
}
