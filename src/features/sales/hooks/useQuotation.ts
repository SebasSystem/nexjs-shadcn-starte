'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { quotationService } from '../services/quotation.service';
import type { Quotation } from '../types/sales.types';

export function useQuotation(opportunityUid: string) {
  const queryClient = useQueryClient();

  const {
    data: quotations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKeys.sales.quotations, { opportunityUid }],
    queryFn: async () => {
      const list = await quotationService.getList();
      return list.filter((q) => q.quoteable_uid === opportunityUid);
    },
    enabled: !!opportunityUid,
  });

  const quotation = quotations[0] ?? null;

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Quotation>) => {
      if (quotation) {
        return quotationService.update(quotation.uid, data);
      }
      return quotationService.create({
        ...data,
        quoteable_uid: opportunityUid,
        quoteable_type: 'opportunity',
      } as Partial<Quotation>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.sales.quotations, { opportunityUid }],
      });
    },
  });

  return {
    quotation,
    isLoading,
    error: error ?? null,
    saveQuotation: (data: Partial<Quotation>) => saveMutation.mutateAsync(data),
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.sales.quotations, { opportunityUid }],
      }),
  };
}

export function useQuotationById(quotationUid: string) {
  const queryClient = useQueryClient();

  const {
    data: quotation = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKeys.sales.quotations, quotationUid],
    queryFn: () => quotationService.getOne(quotationUid),
    enabled: !!quotationUid,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Quotation>) => {
      if (!quotation) throw new Error('No quotation loaded');
      return quotationService.update(quotation.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.sales.quotations, quotationUid] });
    },
  });

  return {
    quotation,
    isLoading,
    error: error ?? null,
    saveQuotation: (data: Partial<Quotation>) => saveMutation.mutateAsync(data),
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: [...queryKeys.sales.quotations, quotationUid] }),
  };
}
