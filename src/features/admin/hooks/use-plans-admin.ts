'use client';

import { useCallback, useEffect, useState } from 'react';
import { plansService } from 'src/features/admin/services/plans.service';
import { PlanSaaS } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'admin:plans';

export function usePlansAdmin() {
  const cached = cache.get<PlanSaaS[]>(CACHE_KEY);
  const [planes, setPlanes] = useState<PlanSaaS[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);

  const fetchPlanes = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const data = await plansService.getAll();
      cache.set(CACHE_KEY, data);
      setPlanes(data);
    } finally {
      setIsLoading(false);
    }
  }, [cached]);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const createPlan = useCallback(
    async (data: Omit<PlanSaaS, 'uid' | 'created_at' | 'total_tenants'>) => {
      const created = await plansService.create(data);
      cache.invalidate(CACHE_KEY);
      setPlanes((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updatePlan = useCallback(async (uid: string, data: Partial<PlanSaaS>) => {
    const updated = await plansService.update(uid, data);
    cache.invalidate(CACHE_KEY);
    setPlanes((prev) => prev.map((p) => (p.uid === uid ? updated : p)));
    return updated;
  }, []);

  return { planes, isLoading, refetch: fetchPlanes, createPlan, updatePlan };
}
