'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { commissionService, type SimulateBreakdownItem } from '../services/commission.service';

export const useSimulator = () => {
  // NOTE: 'plan-1' is a placeholder. Ideally the first plan from the
  // active commission plans list should be used. See required-backend-v2/
  const [planUid, setPlanUid] = useState<string>('plan-1');
  const [accumulatedSales, setAccumulatedSales] = useState<number>(0);
  const [hypotheticalSale, setHypotheticalSale] = useState<number>(0);

  const simulateMutation = useMutation({
    mutationFn: () =>
      commissionService.simulate({
        plan_uid: planUid,
        accumulated_sales: accumulatedSales,
        hypothetical_sale: hypotheticalSale,
      }),
  });

  const breakdown: SimulateBreakdownItem[] = simulateMutation.data?.breakdown ?? [];
  const totalCommission = simulateMutation.data?.total ?? 0;

  // Derive current tier from accumulated sales against breakdown
  const currentTier = (() => {
    if (!accumulatedSales || accumulatedSales <= 0 || !breakdown.length) return null;
    for (let i = breakdown.length - 1; i >= 0; i--) {
      if (breakdown[i].amountInTier > 0) return { ...breakdown[i], index: i + 1 };
    }
    return { ...breakdown[0], index: 1 };
  })();

  const resetForm = () => {
    setAccumulatedSales(0);
    setHypotheticalSale(0);
    simulateMutation.reset();
  };

  // Trigger simulation when params change
  const simulate = () => {
    if (hypotheticalSale > 0 || accumulatedSales > 0) {
      simulateMutation.mutate();
    }
  };

  return {
    planUid,
    setPlanUid,
    accumulatedSales,
    setAccumulatedSales,
    hypotheticalSale,
    setHypotheticalSale,
    breakdown,
    totalCommission,
    currentTier,
    isSimulating: simulateMutation.isPending,
    simulate,
    resetForm,
  };
};
