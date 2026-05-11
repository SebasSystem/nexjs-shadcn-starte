'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { automationService } from '../services/automation.service';
import type { AutomationRule } from '../types';

export function useAutomationRules() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: [...queryKeys.automation.rules, pagination.params],
    queryFn: async () => {
      const res = await automationService.getAll(pagination.params);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ?? []) as AutomationRule[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  // Trigger events from backend (replaces hardcoded types)
  const { data: triggerEventsData } = useQuery({
    queryKey: [...queryKeys.automation.rules, 'trigger-events'],
    queryFn: () => automationService.getTriggerEvents(),
    staleTime: 0,
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
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<AutomationRule> }) =>
      automationService.update(uid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => automationService.delete(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: (uid: string) => automationService.toggleRule(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    rules,
    isLoading,
    stats,
    triggerEvents: triggerEventsData as Record<string, unknown> | undefined,
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
    toggleRule: async (uid: string): Promise<boolean> => {
      await toggleMutation.mutateAsync(uid);
      return true;
    },
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
