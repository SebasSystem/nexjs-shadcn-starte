'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { financeService } from '../services/finance.service';
import type { CreditRuleSettings } from '../types/sales.types';

const DEFAULT_RULES: CreditRuleSettings = {
  max_days: 30,
  max_amount: 50000,
  auto_block: true,
};

export function useCreditRules() {
  const queryClient = useQueryClient();

  const { data: rules = DEFAULT_RULES, isLoading: rulesLoading } = useQuery({
    queryKey: queryKeys.sales.creditRules,
    queryFn: () => financeService.getCreditRules(),
    placeholderData: DEFAULT_RULES,
  });

  const { data: exceptions = [], isLoading: excLoading } = useQuery({
    queryKey: queryKeys.sales.creditExceptions,
    queryFn: () => financeService.listCreditExceptions(),
    placeholderData: [],
  });

  const { mutateAsync: saveRulesMutation } = useMutation({
    mutationFn: (data: CreditRuleSettings) => financeService.saveCreditRules(data),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.creditRules });
    },
  });

  const saveRules = async (data: CreditRuleSettings) => {
    await saveRulesMutation(data);
  };

  return {
    rules,
    exceptions,
    isLoading: rulesLoading || excLoading,
    saveRules,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.creditRules });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.creditExceptions });
    },
  };
}
