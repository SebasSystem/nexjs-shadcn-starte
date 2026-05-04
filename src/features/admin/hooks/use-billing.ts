'use client';

import { useCallback, useEffect, useState } from 'react';
import { billingService } from 'src/features/admin/services/billing.service';
import { Factura } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const CACHE_KEY = 'admin:billing';

export function useBilling() {
  const cached = cache.get<Factura[]>(CACHE_KEY);
  const [facturas, setFacturas] = useState<Factura[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);

  const fetchFacturas = useCallback(async () => {
    setIsLoading(!cached);
    try {
      const data = await billingService.getAll();
      cache.set(CACHE_KEY, data);
      setFacturas(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return { facturas, isLoading, refetch: fetchFacturas, marcarPagada, marcarPagadas };
}
