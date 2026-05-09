'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { plansService } from 'src/features/admin/services/plans.service';
import { PlanSaaS } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'admin:plans';

export function usePlansAdmin() {
  const cached = cache.get<PlanSaaS[]>(CACHE_KEY);
  const hasCache = useRef(!!cached);
  const [planes, setPlanes] = useState<PlanSaaS[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!hasCache.current);

  const fetchPlanes = useCallback(async () => {
    setIsLoading(!hasCache.current);
    try {
      const data = await plansService.getAll();
      cache.set(CACHE_KEY, data);
      setPlanes(data);
      hasCache.current = true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const createPlan = useCallback(
    async (data: Omit<PlanSaaS, 'uid' | 'created_at' | 'total_tenants'>) => {
      await plansService.create(data);
      await fetchPlanes();
      return;
    },
    [fetchPlanes]
  );

  const updatePlan = useCallback(
    async (uid: string, data: Partial<PlanSaaS>) => {
      await plansService.update(uid, data);
      await fetchPlanes();
      return;
    },
    [fetchPlanes]
  );

  const deletePlan = useCallback(
    async (uid: string) => {
      await plansService.delete(uid);
      await fetchPlanes();
    },
    [fetchPlanes]
  );

  return { planes, isLoading, refetch: fetchPlanes, createPlan, updatePlan, deletePlan };
}
