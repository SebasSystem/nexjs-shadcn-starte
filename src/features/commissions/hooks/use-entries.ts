'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';

import { commissionService } from '../services/commission.service';

export const useEntries = () => {
  const queryClient = useQueryClient();

  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.commissions.entries,
    queryFn: () => commissionService.entries.list(),
  });

  const payMutation = useMutation({
    mutationFn: (uid: string) => commissionService.entries.pay(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.entries });
      toast.success('Entrada marcada como pagada');
    },
    onError: () => toast.error('Error al marcar como pagada'),
  });

  return {
    entries,
    isLoading,
    isError,
    isSubmitting: payMutation.isPending,
    fetchEntries: refetch,
    payEntry: async (uid: string) => {
      return await payMutation.mutateAsync(uid);
    },
  };
};
