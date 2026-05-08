'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from 'src/features/dashboard/services/dashboard.service';
import type { RecentActivity } from 'src/features/dashboard/types/dashboard.types';
import { queryKeys } from 'src/lib/query-keys';

export function useDashboard() {
  const queryClient = useQueryClient();

  const { data: raw, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.core,
    queryFn: () => dashboardService.getCore(),
  });

  return {
    data: raw,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.core }),
  };
}

export function useDashboardActivities() {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.activities,
    queryFn: async () => {
      const result = await dashboardService.getRecentActivities(10);
      return result as RecentActivity[];
    },
  });

  return {
    activities,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activities }),
  };
}
