'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { currencyService } from '../services/currency.service';
import type { CurrencyRate } from '../types/sales.types';

export function useCurrencyRates() {
  const {
    data: fetched = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.sales.currencyRates,
    queryFn: async () => {
      const data = await currencyService.getRates();
      return (data ?? []) as CurrencyRate[];
    },
  });

  const [isDirty, setIsDirty] = useState(false);
  const [localRates, setLocalRates] = useState<CurrencyRate[]>([]);

  const rates = useMemo(() => (isDirty ? localRates : fetched), [isDirty, localRates, fetched]);

  const setRates = useCallback((next: CurrencyRate[]) => {
    setIsDirty(true);
    setLocalRates(next);
  }, []);

  return { rates, setRates, isLoading, error: error ?? null, refresh: refetch };
}
