'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inventoryWarehouseService } from 'src/features/inventory/services/inventory-warehouse.service';
import type {
  CreateWarehousePayload,
  Warehouse,
  WarehouseListSummary,
} from 'src/features/inventory/types/inventory.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'inventory:warehouses';
const SUMMARY_KEY = 'inventory:warehouses:summary';

const EMPTY_SUMMARY: WarehouseListSummary = { total_warehouses: 0, active_warehouses: 0 };

export function useWarehouses() {
  const [items, setItems] = useState<Warehouse[]>(cache.get<Warehouse[]>(CACHE_KEY) ?? []);
  const [summary, setSummary] = useState<WarehouseListSummary>(
    cache.get<WarehouseListSummary>(SUMMARY_KEY) ?? EMPTY_SUMMARY
  );
  const [isLoading, setIsLoading] = useState(!cache.get(CACHE_KEY));

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await inventoryWarehouseService.list();
      cache.set(CACHE_KEY, result.data);
      cache.set(SUMMARY_KEY, result.summary);
      setItems(result.data);
      setSummary({ ...EMPTY_SUMMARY, ...result.summary });
    } catch {
      toast.error('Error al cargar bodegas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createWarehouse = useCallback(async (payload: CreateWarehousePayload) => {
    const created = await inventoryWarehouseService.create(payload);
    setItems((prev) => {
      const next = [...prev, created];
      cache.set(CACHE_KEY, next);
      return next;
    });
    return created;
  }, []);

  const updateWarehouse = useCallback(
    async (uid: string, payload: Partial<CreateWarehousePayload>) => {
      const updated = await inventoryWarehouseService.update(uid, payload);
      setItems((prev) => {
        const next = prev.map((w) => (w.uid === uid ? updated : w));
        cache.set(CACHE_KEY, next);
        return next;
      });
      return updated;
    },
    []
  );

  const removeWarehouse = useCallback(async (uid: string) => {
    await inventoryWarehouseService.remove(uid);
    setItems((prev) => {
      const next = prev.filter((w) => w.uid !== uid);
      cache.set(CACHE_KEY, next);
      return next;
    });
  }, []);

  return { items, summary, isLoading, refetch, createWarehouse, updateWarehouse, removeWarehouse };
}
