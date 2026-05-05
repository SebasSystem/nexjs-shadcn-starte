'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';

import {
  type CreatePlanPayload,
  plansService,
  type UpdatePlanPayload,
} from '../services/plans.service';
import type { CommissionPlan } from '../types/commissions.types';

export const usePlans = () => {
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.commissions.plans,
    queryFn: () => plansService.getPlans(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanPayload) => plansService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.plans });
      toast.success('Plan creado correctamente');
    },
    onError: () => toast.error('Error al crear el plan'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdatePlanPayload }) =>
      plansService.updatePlan(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.plans });
      toast.success('Plan actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el plan'),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => plansService.deletePlan(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.plans });
      toast.success('Plan eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar el plan'),
  });

  return {
    plans,
    isLoading,
    isError,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    fetchPlans: refetch,
    createPlan: async (data: CreatePlanPayload): Promise<CommissionPlan> => {
      return await createMutation.mutateAsync(data);
    },
    updatePlan: async (uid: string, data: UpdatePlanPayload): Promise<CommissionPlan> => {
      return await updateMutation.mutateAsync({ uid, data });
    },
    deletePlan: async (uid: string): Promise<void> => {
      await deleteMutation.mutateAsync(uid);
    },
  };
};
