'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { segmentsService } from '../services/segments.service';
import type { Segment, SegmentPayload } from '../types/segments.types';

export function useSegments() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: [...queryKeys.contacts.segments.list, pagination.params],
    queryFn: async () => {
      const res = await segmentsService.list(pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return (res as unknown as { data?: Segment[] }).data ?? ([] as Segment[]);
    },
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
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
