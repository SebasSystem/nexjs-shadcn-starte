'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import type {
  AdjustStockPayload,
  InventoryMovement,
  MovementsSummary,
  TransferStockPayload,
} from 'src/features/inventory/types/inventory.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'inventory:movements';
const SUMMARY_KEY = 'inventory:movements:summary';

const EMPTY_SUMMARY: MovementsSummary = { total: 0, entries: 0, transfers: 0, adjustments: 0 };

export function useMovements(filters?: {
  product_uid?: string;
  warehouse_uid?: string;
  type?: string;
}) {
  const cacheKey = filters ? `${CACHE_KEY}:${JSON.stringify(filters)}` : CACHE_KEY;
  const [items, setItems] = useState<InventoryMovement[]>(
    cache.get<InventoryMovement[]>(cacheKey) ?? []
  );
  const [summary, setSummary] = useState<MovementsSummary>(
    cache.get<MovementsSummary>(SUMMARY_KEY) ?? EMPTY_SUMMARY
  );
  const [isLoading, setIsLoading] = useState(!cache.get(cacheKey));

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [result, summaryResult] = await Promise.allSettled([
        inventoryStockService.movements(filters),
        inventoryStockService.movementsSummary(),
      ]);
      if (result.status === 'fulfilled') {
        const normalized = Array.isArray(result.value) ? result.value : [];
        cache.set(cacheKey, normalized);
        setItems(normalized);
      }
      if (summaryResult.status === 'fulfilled') {
        cache.set(SUMMARY_KEY, summaryResult.value);
        setSummary(summaryResult.value);
      }
    } catch {
      toast.error('Error al cargar movimientos');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const adjust = useCallback(
    async (payload: AdjustStockPayload) => {
      await inventoryStockService.adjust(payload);
      await refetch();
    },
    [refetch]
  );

  const transfer = useCallback(
    async (payload: TransferStockPayload) => {
      await inventoryStockService.transfer(payload);
      await refetch();
    },
    [refetch]
  );

  return { items, summary, isLoading, refetch, adjust, transfer };
}
