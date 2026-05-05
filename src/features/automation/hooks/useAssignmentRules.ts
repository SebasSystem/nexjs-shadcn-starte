'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { assignmentService } from '../services/assignment.service';
import type { AssignmentRule } from '../types';

export function useAssignmentRules() {
  const queryClient = useQueryClient();

  const { data: assignmentRules = [], isLoading } = useQuery({
    queryKey: queryKeys.automation.assignmentRules,
    queryFn: () => assignmentService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<AssignmentRule, 'uid' | 'created_at' | 'round_robin_index'>) =>
      assignmentService.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.assignmentRules }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<AssignmentRule> }) =>
      assignmentService.update(uid, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.assignmentRules }),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => assignmentService.delete(uid),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.assignmentRules }),
  });

  return {
    assignmentRules,
    isLoading,
    createAssignmentRule: async (
      data: Omit<AssignmentRule, 'uid' | 'created_at' | 'round_robin_index'>
    ): Promise<boolean> => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateAssignmentRule: async (uid: string, data: Partial<AssignmentRule>): Promise<boolean> => {
      await updateMutation.mutateAsync({ uid, data });
      return true;
    },
    deleteAssignmentRule: async (uid: string): Promise<void> => {
      await deleteMutation.mutateAsync(uid);
    },
  };
}
