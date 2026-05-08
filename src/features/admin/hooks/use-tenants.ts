'use client';

import { useCallback, useEffect, useState } from 'react';
import { tenantsService } from 'src/features/admin/services/tenants.service';
import { Tenant } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const CACHE_KEY = 'admin:tenants';

export function useTenants() {
  const cached = cache.get<Tenant[]>(CACHE_KEY);
  const [tenants, setTenants] = useState<Tenant[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const pagination = usePaginationParams();

  const fetchTenants = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const res = await tenantsService.getAll(pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      const data = ((res as unknown as { data?: Tenant[] }).data ?? []) as Tenant[];
      cache.set(CACHE_KEY, data);
      setTenants(data);
    } finally {
      setIsLoading(false);
    }
  }, [cached, pagination.params]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = useCallback(
    async (data: Omit<Tenant, 'uid' | 'created_at' | 'last_access_at'>) => {
      const created = await tenantsService.create(data);
      cache.invalidate(CACHE_KEY);
      setTenants((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateTenant = useCallback(async (uid: string, data: Partial<Tenant>) => {
    const updated = await tenantsService.update(uid, data);
    cache.invalidate(CACHE_KEY);
    setTenants((prev) => prev.map((t) => (t.uid === uid ? updated : t)));
    return updated;
  }, []);

  const suspendTenant = useCallback(async (uid: string) => {
    const updated = await tenantsService.suspend(uid);
    cache.invalidate(CACHE_KEY);
    setTenants((prev) => prev.map((t) => (t.uid === uid ? updated : t)));
    return updated;
  }, []);

  const activateTenant = useCallback(async (uid: string) => {
    const updated = await tenantsService.activate(uid);
    cache.invalidate(CACHE_KEY);
    setTenants((prev) => prev.map((t) => (t.uid === uid ? updated : t)));
    return updated;
  }, []);

  const createTenantUser = useCallback(
    async (tenantUid: string, data: { name: string; email: string; role: string }) => {
      await tenantsService.createUser(tenantUid, data);
    },
    []
  );

  return {
    tenants,
    isLoading,
    refetch: fetchTenants,
    createTenant,
    updateTenant,
    suspendTenant,
    activateTenant,
    createTenantUser,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
