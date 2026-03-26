'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tenant } from 'src/features/admin/types/admin.types';
import { tenantsService } from 'src/features/admin/services/tenants.service';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tenantsService.getAll();
      setTenants(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = useCallback(
    async (data: Omit<Tenant, 'id' | 'creadoEn' | 'ultimoAcceso'>) => {
      const newTenant = await tenantsService.create(data);
      setTenants((prev) => [...prev, newTenant]);
      return newTenant;
    },
    []
  );

  const updateTenant = useCallback(async (id: string, data: Partial<Tenant>) => {
    const updated = await tenantsService.update(id, data);
    setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const suspendTenant = useCallback(async (id: string) => {
    const updated = await tenantsService.suspend(id);
    setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  return {
    tenants,
    isLoading,
    refetch: fetchTenants,
    createTenant,
    updateTenant,
    suspendTenant,
  };
}
