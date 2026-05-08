'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { productivityService } from '../services/productivity.service';
import type { Interaction, InteractionType } from '../types/productivity.types';

export function useInteractions(contactUid: string) {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const queryKey = queryKeys.productivity.interactions.byContact(contactUid);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: [...queryKey, pagination.params],
    queryFn: async () => {
      const res = await productivityService.listInteractions(contactUid, pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return ((res as unknown as { data?: Interaction[] }).data ?? []) as Interaction[];
    },
    enabled: !!contactUid,
  });

  const addInteraction = async (type: InteractionType, content: string): Promise<boolean> => {
    try {
      await productivityService.createInteraction(contactUid, { type, content });
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch {
      return false;
    }
  };

  return {
    data: interactions,
    isLoading,
    addInteraction,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
