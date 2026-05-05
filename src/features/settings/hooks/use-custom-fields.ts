'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { customFieldsService } from '../services/custom-fields.service';
import type { CustomField } from '../types/settings.types';

export function useCustomFields() {
  const queryClient = useQueryClient();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: queryKeys.settings.customFields,
    queryFn: () => customFieldsService.getAll(),
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
  };
}
