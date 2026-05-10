'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';

import { localizationService } from '../services/localization.service';
import type { LocalizationConfig } from '../types/settings.types';

export function useLocalization() {
  const queryClient = useQueryClient();

  const { data: config = null, isLoading } = useQuery({
    queryKey: queryKeys.settings.localization,
    staleTime: 0,
    queryFn: () => localizationService.get(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<LocalizationConfig>) => localizationService.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.localization }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    config,
    isLoading,
    isSaving: saveMutation.isPending,
    saveConfig: async (data: Partial<LocalizationConfig>): Promise<boolean> => {
      await saveMutation.mutateAsync(data);
      return true;
    },
  };
}
