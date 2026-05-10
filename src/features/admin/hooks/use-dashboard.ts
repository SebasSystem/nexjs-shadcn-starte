'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardPeriod, dashboardService } from 'src/features/admin/services/dashboard.service';
import { DashboardData } from 'src/features/admin/types/admin.types';

export function useDashboard(period?: DashboardPeriod) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dashboardService.get(period);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, refetch: fetch };
}
