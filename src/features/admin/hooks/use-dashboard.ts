'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from 'src/features/admin/services/dashboard.service';
import { DashboardData } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'admin:dashboard';

const EMPTY: DashboardData = {
  mrr_total: 0,
  mrr_growth_percent: 0,
  mrr_history: [],
  tenants_activos: 0,
  tenants_trial: 0,
  facturas_vencidas: 0,
  errores_criticos_24h: 0,
  tenants_en_riesgo: [],
  tenants_recientes: [],
};

export function useDashboard() {
  const cached = cache.get<DashboardData>(CACHE_KEY);
  const [data, setData] = useState<DashboardData>(cached ?? EMPTY);
  const [isLoading, setIsLoading] = useState(!cached);

  const fetch = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const result = await dashboardService.get();
      cache.set(CACHE_KEY, result);
      setData(result);
    } catch {
      if (!cached) setData(EMPTY);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
