'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { commissionService } from '../services/commission.service';
import type { CreateFinancialRecordPayload } from '../types/commissions.types';

export const useFinancialRecords = () => {
  const createMutation = useMutation({
    mutationFn: (data: CreateFinancialRecordPayload) =>
      commissionService.financialRecords.create(data),
    onSuccess: () => {
      toast.success('Registro financiero creado correctamente');
    },
    onError: () => toast.error('Error al crear el registro financiero'),
  });

  return {
    isSubmitting: createMutation.isPending,
    createFinancialRecord: async (data: CreateFinancialRecordPayload) => {
      return await createMutation.mutateAsync(data);
    },
  };
};
