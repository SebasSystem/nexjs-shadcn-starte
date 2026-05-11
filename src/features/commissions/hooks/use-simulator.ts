'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { commissionService } from '../services/commission.service';
import type { SimulateResult } from '../types/commissions.types';

export const useSimulator = () => {
  // planUid is set by the view (SimulatorView) via useEffect from usePlans().
  // If no active plan exists, the view shows "Selecciona un plan" and the
  // simulate() call is guarded against empty planUid.
  const [planUid, setPlanUid] = useState<string>('');
  const [accumulatedSales, setAccumulatedSales] = useState<number>(0);
  const [hypotheticalSale, setHypotheticalSale] = useState<number>(0);
  const [marginAmount, setMarginAmount] = useState<number | undefined>(undefined);

  const simulateMutation = useMutation({
    mutationFn: () =>
      commissionService.simulate({
        plan_uid: planUid,
        total_sales: accumulatedSales + hypotheticalSale,
        ...(marginAmount !== undefined && marginAmount > 0 ? { margin_amount: marginAmount } : {}),
      }),
  });

  const result: SimulateResult | null = simulateMutation.data ?? null;
  const totalCommission = result?.commission_amount ?? 0;
  const effectivePercentage = result?.effective_percentage ?? 0;
  const tierApplied = result?.tier_applied ?? 0;

  // Derive current tier from accumulated sales and the tier returned by backend
  const currentTier = tierApplied > 0 ? `Tramo ${tierApplied} (${effectivePercentage}%)` : null;

  const resetForm = () => {
    setAccumulatedSales(0);
    setHypotheticalSale(0);
    setMarginAmount(undefined);
    simulateMutation.reset();
  };

  // Trigger simulation when params change
  const simulate = () => {
    if (!planUid) return; // No plan selected yet — wait for view to set it
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
    marginAmount,
    setMarginAmount,
    totalCommission,
    effectivePercentage,
    tierApplied,
    currentTier,
    isSimulating: simulateMutation.isPending,
    simulate,
    resetForm,
  };
};
