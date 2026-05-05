'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryProductService } from 'src/features/inventory/services/inventory-product.service';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import type {
  CreateProductPayload,
  InventoryCategory,
  InventoryMasterSummary,
} from 'src/features/inventory/types/inventory.types';
import { queryKeys } from 'src/lib/query-keys';

const EMPTY_SUMMARY: InventoryMasterSummary = {
  products: 0,
  active_products: 0,
  out_of_stock_count: 0,
  total_physical_stock: 0,
  total_reserved_stock: 0,
  total_available_stock: 0,
};

export function useProducts() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory.products,
    queryFn: async () => {
      const masterRes = await inventoryProductService.master();
      return masterRes.data.map((p) => ({ ...p, stocks: p.stocks ?? [] }));
    },
  });

  const { data: masterRes } = useQuery({
    queryKey: ['inventory', 'products', 'summary'],
    queryFn: () => inventoryProductService.master(),
  });
  const summary: InventoryMasterSummary = { ...EMPTY_SUMMARY, ...masterRes?.summary };

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.inventory.categories,
    queryFn: () => inventoryStockService.categories(),
  });

  const createProduct = useMutation({
    mutationFn: (payload: CreateProductPayload) => inventoryProductService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products });
      toast.success('Producto creado');
    },
    onError: () => toast.error('Error al crear producto'),
  });

  const updateProduct = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<CreateProductPayload> }) =>
      inventoryProductService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products });
      toast.success('Producto actualizado');
    },
    onError: () => toast.error('Error al actualizar producto'),
  });

  const removeProduct = useMutation({
    mutationFn: (uid: string) => inventoryProductService.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products });
      toast.success('Producto eliminado');
    },
    onError: () => toast.error('Error al eliminar producto'),
  });

  return {
    items,
    summary,
    categories: categories as InventoryCategory[],
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products }),
    createProduct: (payload: CreateProductPayload) => createProduct.mutateAsync(payload),
    updateProduct: (uid: string, payload: Partial<CreateProductPayload>) =>
      updateProduct.mutateAsync({ uid, payload }),
    removeProduct: (uid: string) => removeProduct.mutateAsync(uid),
  };
}
