'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { financeService } from '../services/finance.service';
import type { FinanceDashboard } from '../types/sales.types';

export function useFinanceDashboard() {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery<FinanceDashboard>({
    queryKey: queryKeys.sales.financeDashboard,
    queryFn: () => financeService.getDashboard(),
  });

  return { dashboard, isLoading, error: error ?? null };
}
