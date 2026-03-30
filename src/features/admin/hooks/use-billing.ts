'use client';

import { useState, useEffect, useCallback } from 'react';
import { Factura } from 'src/features/admin/types/admin.types';
import { billingService } from 'src/features/admin/services/billing.service';

export function useBilling() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacturas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await billingService.getAll();
      setFacturas(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const marcarPagada = useCallback(async (id: string) => {
    const updated = await billingService.marcarPagada(id);
    setFacturas((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  }, []);

  const marcarPagadas = useCallback(async (ids: string[]) => {
    const updated = await billingService.marcarPagadas(ids);
    setFacturas((prev) =>
      prev.map((f) => {
        const found = updated.find((u) => u.id === f.id);
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
  };
}
