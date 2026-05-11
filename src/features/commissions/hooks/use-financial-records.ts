'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';

import { commissionService } from '../services/commission.service';
import type { CreateFinancialRecordPayload } from '../types/commissions.types';

export const useFinancialRecords = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateFinancialRecordPayload) =>
      commissionService.financialRecords.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.entries });
      toast.success('Registro financiero creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    isSubmitting: createMutation.isPending,
    createFinancialRecord: async (data: CreateFinancialRecordPayload) => {
      return await createMutation.mutateAsync(data);
    },
  };
};
