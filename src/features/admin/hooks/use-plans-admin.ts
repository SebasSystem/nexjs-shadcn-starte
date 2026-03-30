'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlanSaaS } from 'src/features/admin/types/admin.types';
import { plansService } from 'src/features/admin/services/plans.service';

export function usePlansAdmin() {
  const [planes, setPlanes] = useState<PlanSaaS[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await plansService.getAll();
      setPlanes(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const createPlan = useCallback(
    async (data: Omit<PlanSaaS, 'id' | 'creadoEn' | 'totalTenants'>) => {
      const newPlan = await plansService.create(data);
      setPlanes((prev) => [...prev, newPlan]);
      return newPlan;
    },
    []
  );

  const updatePlan = useCallback(async (id: string, data: Partial<PlanSaaS>) => {
    const updated = await plansService.update(id, data);
    setPlanes((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  return {
    planes,
    isLoading,
    refetch: fetchPlanes,
    createPlan,
    updatePlan,
  };
}
