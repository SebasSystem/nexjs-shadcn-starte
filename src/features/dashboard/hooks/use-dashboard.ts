'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from 'src/features/dashboard/services/dashboard.service';
import type {
  DashboardCoreData,
  RecentActivity,
} from 'src/features/dashboard/types/dashboard.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'dashboard:core';
const ACTIVITIES_CACHE_KEY = 'dashboard:activities';

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
  const cached = cache.get<DashboardCoreData>(CACHE_KEY);
  const [data, setData] = useState<DashboardCoreData>(cached ?? EMPTY_CORE);
  const [isLoading, setIsLoading] = useState(!cached);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dashboardService.getCore();
      const merged: DashboardCoreData = {
        ...EMPTY_CORE,
        ...result,
        summary: { ...EMPTY_CORE.summary, ...result.summary },
        breakdown: { ...EMPTY_CORE.breakdown, ...result.breakdown },
        totals: { ...EMPTY_CORE.totals, ...result.totals },
        kpis: { ...EMPTY_CORE.kpis, ...result.kpis },
      };
      cache.set(CACHE_KEY, merged);
      setData(merged);
    } catch {
      setData(EMPTY_CORE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

export function useDashboardActivities() {
  const cached = cache.get<RecentActivity[]>(ACTIVITIES_CACHE_KEY);
  const [activities, setActivities] = useState<RecentActivity[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dashboardService.getRecentActivities(10);
      cache.set(ACTIVITIES_CACHE_KEY, result);
      setActivities(result);
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { activities, isLoading, refetch };
}
