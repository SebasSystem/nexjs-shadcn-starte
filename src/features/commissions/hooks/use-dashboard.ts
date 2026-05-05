'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import type { DashboardData } from '../services/commission.service';
import { commissionService } from '../services/commission.service';

// Re-export for backward compatibility
export type { DashboardData as DashboardKPIs };
export type { TierProgress } from '../services/commission.service';

export type TramoProgreso = DashboardData['tiers'][0];
export type VentaReciente = DashboardData['recentSales'][0];

export const useDashboardCommissions = (userUid?: string | null) => {
  const isAdminView = !!userUid;

  const query = useQuery({
    queryKey: queryKeys.commissions.dashboard,
    queryFn: () =>
      isAdminView ? commissionService.getDashboard(userUid!) : commissionService.getMySummary(),
  });

  const data = query.data;

  return {
    kpis: data?.kpis ?? null,
    tiersProgress: data?.tiers ?? [],
    recentSales: data?.recentSales ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
