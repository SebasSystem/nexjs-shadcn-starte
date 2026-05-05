'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from 'src/features/dashboard/services/dashboard.service';
import type {
  DashboardCoreData,
  RecentActivity,
} from 'src/features/dashboard/types/dashboard.types';
import { queryKeys } from 'src/lib/query-keys';

const EMPTY_CORE: DashboardCoreData = {
  summary: { new_customers_today: 0, overdue_tasks_today: 0, tasks_supported: false },
  breakdown: {
    accounts_created_today: 0,
    contacts_created_today: 0,
    crm_entities_created_today: 0,
    tasks_due_today: 0,
  },
  totals: { accounts: 0, contacts: 0, crm_entities: 0, tags: 0, tasks: 0 },
  kpis: { conversion_rate: 0, mrr: 0, at_risk_count: 0 },
  top_tags: [],
  overdue_tasks: [],
  recent_quotations: [],
  low_stock_products: [],
  monthly_sales: [],
};

export function useDashboard() {
  const { data: raw, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.core,
    queryFn: async () => {
      const result = await dashboardService.getCore();
      return {
        ...EMPTY_CORE,
        ...result,
        summary: { ...EMPTY_CORE.summary, ...result.summary },
        breakdown: { ...EMPTY_CORE.breakdown, ...result.breakdown },
        totals: { ...EMPTY_CORE.totals, ...result.totals },
        kpis: { ...EMPTY_CORE.kpis, ...result.kpis },
      };
    },
  });

  return { data: raw ?? EMPTY_CORE, isLoading, refetch: () => {} };
}

export function useDashboardActivities() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.activities,
    queryFn: async () => {
      const result = await dashboardService.getRecentActivities(10);
      return result as RecentActivity[];
    },
  });

  return { activities, isLoading, refetch: () => {} };
}
