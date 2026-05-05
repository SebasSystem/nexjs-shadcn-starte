'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { segmentsService } from '../services/segments.service';
import type { SegmentPayload } from '../types/segments.types';

export function useSegments() {
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: queryKeys.contacts.segments.list,
    queryFn: () => segmentsService.list(),
  });

  const createSegment = async (payload: SegmentPayload): Promise<boolean> => {
    try {
      await segmentsService.create(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      return true;
    } catch {
      return false;
    }
  };

  const updateSegment = async (uid: string, payload: Partial<SegmentPayload>): Promise<boolean> => {
    try {
      await segmentsService.update(uid, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      return true;
    } catch {
      return false;
    }
  };

  const deleteSegment = async (uid: string): Promise<boolean> => {
    try {
      await segmentsService.remove(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      return true;
    } catch {
      return false;
    }
  };

  return {
    segments,
    isLoading,
    createSegment,
    updateSegment,
    deleteSegment,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list }),
  };
}
