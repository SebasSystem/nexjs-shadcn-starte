'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';

import { commissionService } from '../services/commission.service';
import type { CreateRulePayload, UpdateRulePayload } from '../types/commissions.types';

export const useRules = () => {
  const queryClient = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.commissions.rules,
    queryFn: () => commissionService.rules.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRulePayload) => commissionService.rules.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.rules });
      toast.success('Regla creada correctamente');
    },
    onError: () => toast.error('Error al crear la regla'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateRulePayload }) =>
      commissionService.rules.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.rules });
      toast.success('Regla actualizada correctamente');
    },
    onError: () => toast.error('Error al actualizar la regla'),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => commissionService.rules.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.rules });
      toast.success('Regla eliminada correctamente');
    },
    onError: () => toast.error('Error al eliminar la regla'),
  });

  return {
    rules,
    isLoading,
    isError,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    fetchRules: refetch,
    createRule: async (data: CreateRulePayload) => {
      return await createMutation.mutateAsync(data);
    },
    updateRule: async (uid: string, data: UpdateRulePayload) => {
      return await updateMutation.mutateAsync({ uid, data });
    },
    deleteRule: async (uid: string) => {
      await deleteMutation.mutateAsync(uid);
    },
  };
};
