'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { purchaseOrderService } from '../services/purchase-order.service';
import type { PurchaseOrderPayload } from '../types/purchase-order.types';

const QUERY_KEY = ['purchases', 'orders'] as const;

export function usePurchaseOrders() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await purchaseOrderService.list();
      return (res.data ?? []) as import('../types/purchase-order.types').PurchaseOrder[];
    },
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
  };
}
