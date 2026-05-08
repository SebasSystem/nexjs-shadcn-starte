'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from 'src/features/admin/services/dashboard.service';
import { DashboardData } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'admin:dashboard';

export function useDashboard() {
  const cached = cache.get<DashboardData>(CACHE_KEY);
  const [data, setData] = useState<DashboardData | null>(cached ?? null);
  const [isLoading, setIsLoading] = useState(!cached);

  const fetch = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const result = await dashboardService.get();
      cache.set(CACHE_KEY, result);
      setData(result);
    } catch {
      if (!cached) setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [cached]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refetch = useCallback(async () => {
    try {
      const result = await dashboardService.get();
      cache.set(CACHE_KEY, result);
      setData(result);
    } catch {
      /* mantener data actual */
    }
  }, []);

  return { data, isLoading, refetch };
}
