'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { billingService } from 'src/features/admin/services/billing.service';
import { Factura } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const CACHE_KEY = 'admin:billing';

export function useBilling() {
  const cached = cache.get<Factura[]>(CACHE_KEY);
  const hasCache = useRef(!!cached);
  const [facturas, setFacturas] = useState<Factura[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!hasCache.current);
  const pagination = usePaginationParams();
  const { params, setTotal } = pagination;

  const fetchFacturas = useCallback(async () => {
    setIsLoading(!hasCache.current);
    try {
      const res = await billingService.getAll(params);
      const meta = extractPaginationMeta(res);
      if (meta) setTotal(meta.total);
      const data = ((res as unknown as { data?: Factura[] }).data ?? []) as Factura[];
      cache.set(CACHE_KEY, data);
      setFacturas(data);
      hasCache.current = true;
    } finally {
      setIsLoading(false);
    }
  }, [params, setTotal]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const marcarPagada = useCallback(
    async (uid: string) => {
      await billingService.marcarPagada(uid);
      await fetchFacturas();
      return;
    },
    [fetchFacturas]
  );

  const marcarPagadas = useCallback(
    async (uids: string[]) => {
      await billingService.marcarPagadas(uids);
      await fetchFacturas();
      return;
    },
    [fetchFacturas]
  );

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
