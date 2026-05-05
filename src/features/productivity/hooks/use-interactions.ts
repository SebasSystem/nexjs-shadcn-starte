'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { productivityService } from '../services/productivity.service';
import type { InteractionType } from '../types/productivity.types';

export function useInteractions(contactUid: string) {
  const queryClient = useQueryClient();

  const queryKey = queryKeys.productivity.interactions.byContact(contactUid);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => productivityService.listInteractions(contactUid),
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
  };
}
