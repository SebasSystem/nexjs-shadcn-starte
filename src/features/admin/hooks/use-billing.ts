'use client';

import { useCallback, useEffect, useState } from 'react';
import { billingService } from 'src/features/admin/services/billing.service';
import { Factura } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const CACHE_KEY = 'admin:billing';

export function useBilling() {
  const cached = cache.get<Factura[]>(CACHE_KEY);
  const [facturas, setFacturas] = useState<Factura[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const pagination = usePaginationParams();

  const fetchFacturas = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const res = await billingService.getAll(pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      const data = ((res as unknown as { data?: Factura[] }).data ?? []) as Factura[];
      cache.set(CACHE_KEY, data);
      setFacturas(data);
    } finally {
      setIsLoading(false);
    }
  }, [cached, pagination.params]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const marcarPagada = useCallback(async (uid: string) => {
    const updated = await billingService.marcarPagada(uid);
    cache.invalidate(CACHE_KEY);
    setFacturas((prev) => prev.map((f) => (f.uid === uid ? updated : f)));
    return updated;
  }, []);

  const marcarPagadas = useCallback(async (uids: string[]) => {
    const updated = await billingService.marcarPagadas(uids);
    cache.invalidate(CACHE_KEY);
    setFacturas((prev) =>
      prev.map((f) => {
        const found = updated.find((u: Factura) => u.uid === f.uid);
        return found || f;
      })
    );
    return updated;
  }, []);

  return {
    facturas,
    isLoading,
    refetch: fetchFacturas,
    marcarPagada,
    marcarPagadas,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
