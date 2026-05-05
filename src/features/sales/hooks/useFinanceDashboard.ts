'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { financeService } from '../services/finance.service';
import type { FinanceDashboard, FinanceDashboardInvoice } from '../types/sales.types';

const EMPTY_STATS = {
  monthly_sales: 0,
  monthly_sales_growth_percent: 0,
  pending_invoices_count: 0,
  pending_invoices_amount: 0,
  overdue_portfolio: 0,
  overdue_clients_count: 0,
  average_margin_percent: 0,
  margin_target_percent: 0,
};

const EMPTY: FinanceDashboard = {
  stats: EMPTY_STATS,
  weekly_sales: [] as number[],
  recent_invoices: [] as FinanceDashboardInvoice[],
};

export function useFinanceDashboard() {
  const {
    data: dashboard = EMPTY,
    isLoading,
    error,
  } = useQuery<FinanceDashboard>({
    queryKey: queryKeys.sales.financeDashboard,
    queryFn: async () => {
      const data = await financeService.getDashboard();
      return {
        stats: { ...EMPTY_STATS, ...(data?.stats ?? {}) },
        weekly_sales: data?.weekly_sales ?? [],
        recent_invoices: data?.recent_invoices ?? [],
      };
    },
  });

  return { dashboard, isLoading, error: error ?? null };
}
