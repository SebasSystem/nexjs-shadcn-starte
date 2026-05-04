'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inventoryProductService } from 'src/features/inventory/services/inventory-product.service';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import type {
  CreateProductPayload,
  InventoryCategory,
  InventoryMasterItem,
  InventoryMasterSummary,
} from 'src/features/inventory/types/inventory.types';
import { cache } from 'src/lib/cache';

const PRODUCTS_KEY = 'inventory:products';
const CATEGORIES_KEY = 'inventory:categories';

const EMPTY_SUMMARY: InventoryMasterSummary = {
  products: 0,
  active_products: 0,
  out_of_stock_count: 0,
  total_physical_stock: 0,
  total_reserved_stock: 0,
  total_available_stock: 0,
};

export function useProducts() {
  const [items, setItems] = useState<InventoryMasterItem[]>(
    cache.get<InventoryMasterItem[]>(PRODUCTS_KEY) ?? []
  );
  const [summary, setSummary] = useState<InventoryMasterSummary>(EMPTY_SUMMARY);
  const [categories, setCategories] = useState<InventoryCategory[]>(
    cache.get<InventoryCategory[]>(CATEGORIES_KEY) ?? []
  );
  const [isLoading, setIsLoading] = useState(!cache.get(PRODUCTS_KEY));

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [masterRes, cats] = await Promise.all([
        inventoryProductService.master(),
        inventoryStockService.categories(),
      ]);
      const normalized = masterRes.data.map((p) => ({ ...p, stocks: p.stocks ?? [] }));
      cache.set(PRODUCTS_KEY, normalized);
      cache.set(CATEGORIES_KEY, cats);
      setItems(normalized);
      setSummary({ ...EMPTY_SUMMARY, ...masterRes.summary });
      setCategories(cats);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createProduct = useCallback(async (payload: CreateProductPayload) => {
    const created = await inventoryProductService.create(payload);
    setItems((prev) => {
      const next = [...prev, created];
      cache.set(PRODUCTS_KEY, next);
      return next;
    });
    setSummary((prev) => ({ ...prev, products: prev.products + 1 }));
    return created;
  }, []);

  const updateProduct = useCallback(async (uid: string, payload: Partial<CreateProductPayload>) => {
    const updated = await inventoryProductService.update(uid, payload);
    setItems((prev) => {
      const next = prev.map((p) => (p.uid === uid ? updated : p));
      cache.set(PRODUCTS_KEY, next);
      return next;
    });
    return updated;
  }, []);

  const removeProduct = useCallback(async (uid: string) => {
    await inventoryProductService.remove(uid);
    setItems((prev) => {
      const next = prev.filter((p) => p.uid !== uid);
      cache.set(PRODUCTS_KEY, next);
      return next;
    });
    setSummary((prev) => ({ ...prev, products: Math.max(0, prev.products - 1) }));
  }, []);

  return {
    items,
    summary,
    categories,
    isLoading,
    refetch,
    createProduct,
    updateProduct,
    removeProduct,
  };
}
