'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';

import { commissionService } from '../services/commission.service';
import type { CreateTargetPayload } from '../types/commissions.types';

export const useTargets = () => {
  const queryClient = useQueryClient();

  const {
    data: targets = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.commissions.targets,
    queryFn: () => commissionService.targets.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTargetPayload) => commissionService.targets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.targets });
      toast.success('Meta creada correctamente');
    },
    onError: () => toast.error('Error al crear la meta'),
  });

  return {
    targets,
    isLoading,
    isError,
    isSubmitting: createMutation.isPending,
    fetchTargets: refetch,
    createTarget: async (data: CreateTargetPayload) => {
      return await createMutation.mutateAsync(data);
    },
  };
};
