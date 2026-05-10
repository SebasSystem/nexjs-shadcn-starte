'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import {
  assignmentService,
  type CreateAssignmentPayload,
  type UpdateAssignmentPayload,
} from '../services/assignment.service';
import type { CommissionAssignment } from '../types/commissions.types';

export const useAssignment = () => {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const {
    data: assignments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.commissions.assignments, pagination.params],
    queryFn: async () => {
      const res = await assignmentService.getAssignments(pagination.params);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ?? []) as CommissionAssignment[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentPayload) => assignmentService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.assignments });
      toast.success('Asignación creada exitosamente');
    },
    onError: () => toast.error('Error al crear la asignación'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateAssignmentPayload }) =>
      assignmentService.updateAssignment(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.assignments });
      toast.success('Asignación actualizada exitosamente');
    },
    onError: () => toast.error('Error al actualizar la asignación'),
  });

  return {
    assignments,
    isLoading,
    isError,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    fetchAssignments: refetch,
    createAssignment: async (data: CreateAssignmentPayload): Promise<CommissionAssignment> => {
      return await createMutation.mutateAsync(data);
    },
    updateAssignment: async (
      uid: string,
      data: UpdateAssignmentPayload
    ): Promise<CommissionAssignment> => {
      return await updateMutation.mutateAsync({ uid, data });
    },
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
};
