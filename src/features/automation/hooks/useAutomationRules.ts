'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { automationService } from '../services/automation.service';
import type { AutomationRule } from '../types';

export function useAutomationRules() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: queryKeys.automation.rules,
    queryFn: () => automationService.getAll(),
  });

  const stats = useMemo(
    () => ({
      activeCount: rules.filter((r) => r.enabled).length,
      inactiveCount: rules.filter((r) => !r.enabled).length,
      totalRuns: rules.reduce((sum, r) => sum + r.run_count, 0),
      lastRun: rules
        .filter((r) => r.last_run_at)
        .sort((a, b) => new Date(b.last_run_at!).getTime() - new Date(a.last_run_at!).getTime())[0]
        ?.last_run_at,
    }),
    [rules]
  );

  const createMutation = useMutation({
    mutationFn: (data: Omit<AutomationRule, 'uid' | 'created_at' | 'run_count' | 'last_run_at'>) =>
      automationService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<AutomationRule> }) =>
      automationService.update(uid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => automationService.delete(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
  });

  return {
    rules,
    isLoading,
    stats,
    createRule: async (
      data: Omit<AutomationRule, 'uid' | 'created_at' | 'run_count' | 'last_run_at'>
    ): Promise<boolean> => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateRule: async (uid: string, data: Partial<AutomationRule>): Promise<boolean> => {
      await updateMutation.mutateAsync({ uid, data });
      return true;
    },
    deleteRule: async (uid: string): Promise<void> => {
      await deleteMutation.mutateAsync(uid);
    },
    toggleRule: async (uid: string): Promise<void> => {
      const current = rules.find((r) => r.uid === uid);
      if (!current) return;
      await updateMutation.mutateAsync({ uid, data: { enabled: !current.enabled } });
    },
  };
}
