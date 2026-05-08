'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryProductService } from 'src/features/inventory/services/inventory-product.service';
import { inventoryStockService } from 'src/features/inventory/services/inventory-stock.service';
import type {
  CreateProductPayload,
  InventoryCategory,
  InventoryMasterItem,
  InventoryMasterResponse,
  InventoryMasterSummary,
} from 'src/features/inventory/types/inventory.types';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

export function useProducts() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: items = [] as InventoryMasterItem[], isLoading } = useQuery({
    queryKey: [...queryKeys.inventory.products, pagination.params],
    queryFn: async () => {
      const masterRes = await inventoryProductService.master(pagination.params);
      const meta = extractPaginationMeta(masterRes);
      if (meta) pagination.setTotal(meta.total);
      const inner = (masterRes as unknown as { data?: InventoryMasterResponse }).data;
      return (inner?.data ?? []) as InventoryMasterItem[];
    },
  });

  const { data: summaryRes } = useQuery({
    queryKey: ['inventory', 'products', 'summary'],
    queryFn: () => inventoryProductService.master(),
  });
  const summary: InventoryMasterSummary | undefined = (
    summaryRes as unknown as { data?: InventoryMasterResponse }
  )?.data?.summary;

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
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
