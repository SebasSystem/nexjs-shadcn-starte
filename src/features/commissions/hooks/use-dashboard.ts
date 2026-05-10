'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';

import type { DashboardData, TierProgress } from '../services/commission.service';
import { commissionService } from '../services/commission.service';

export type { DashboardData as DashboardKPIs, TierProgress };
export type TramoProgreso = TierProgress;
export type VentaReciente = DashboardData['recentSales'][0];

export const useDashboardCommissions = (userUid?: string | null) => {
  const { user } = useAuthContext();
  const targetUid = userUid ?? user?.uid ?? null;

  const query = useQuery({
    queryKey: [...queryKeys.commissions.dashboard, targetUid],
    queryFn: () => commissionService.getDashboard(targetUid!),
    enabled: !!targetUid,
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
