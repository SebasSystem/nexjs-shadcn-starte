'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import {
  type ListPurchaseOrdersParams,
  purchaseOrderService,
} from '../services/purchase-order.service';
import type { PurchaseOrderPayload } from '../types/purchase-order.types';

const QUERY_KEY = ['purchases', 'orders'] as const;

export interface UsePurchaseOrdersParams {
  /** Server-side status filter.
   *  Backend now supports both search and status on GET /purchases/orders */
  status?: string;
}

export function usePurchaseOrders(params?: UsePurchaseOrdersParams) {
  const qc = useQueryClient();
  const pagination = usePaginationParams();

  // Server-side params: page, per_page, search (backend-supported), and optional status filter.
  const serverParams = {
    page: pagination.page,
    per_page: pagination.rowsPerPage,
    ...(pagination.search ? { search: pagination.search } : {}),
    ...(params?.status ? { status: params.status } : {}),
  } as const;

  const { data = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEY, serverParams],
    queryFn: async () => {
      const res = await purchaseOrderService.list(serverParams as ListPurchaseOrdersParams);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return (res.data ?? []) as import('../types/purchase-order.types').PurchaseOrder[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const create = useMutation({
    mutationFn: (p: PurchaseOrderPayload) => purchaseOrderService.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('OC creada');
    },
    onError: () => toast.error('Error al crear OC'),
  });
  const update = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<PurchaseOrderPayload> }) =>
      purchaseOrderService.update(uid, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('OC actualizada');
    },
    onError: () => toast.error('Error al actualizar'),
  });
  const approve = useMutation({
    mutationFn: (uid: string) => purchaseOrderService.approve(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('OC aprobada');
    },
    onError: () => toast.error('Error al aprobar'),
  });
  const receive = useMutation({
    mutationFn: (uid: string) => purchaseOrderService.markReceived(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('OC recibida');
    },
    onError: () => toast.error('Error al recibir'),
  });
  return {
    orders: data,
    isLoading,
    createOrder: create,
    updateOrder: update,
    approveOrder: approve,
    receiveOrder: receive,
    /** Pagination state from backend (server-side). */
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
    /** Search term sent to backend (server-side). */
    search: pagination.search ?? '',
    onChangeSearch: pagination.onChangeSearch,
    status: params?.status ?? 'all',
  };
}
