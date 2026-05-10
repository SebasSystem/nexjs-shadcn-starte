'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { customFieldsService } from '../services/custom-fields.service';
import type { CustomField } from '../types/settings.types';

export function useCustomFields() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: [...queryKeys.settings.customFields, pagination.params],
    staleTime: 0,
    queryFn: async () => {
      const res = await customFieldsService.getAll(pagination.params);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ?? []) as CustomField[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CustomField, 'uid' | 'created_at'>) => customFieldsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<CustomField> }) =>
      customFieldsService.update(uid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields }),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => customFieldsService.delete(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.customFields }),
  });

  return {
    fields,
    isLoading,
    createField: async (data: Omit<CustomField, 'uid' | 'created_at'>): Promise<boolean> => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateField: async (uid: string, data: Partial<CustomField>): Promise<boolean> => {
      await updateMutation.mutateAsync({ uid, data });
      return true;
    },
    deleteField: async (uid: string): Promise<void> => {
      await deleteMutation.mutateAsync(uid);
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
