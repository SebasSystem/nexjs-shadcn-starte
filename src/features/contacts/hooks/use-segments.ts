'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
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
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: SegmentPayload) => segmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      toast.success('Segmento creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<SegmentPayload> }) =>
      segmentsService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      toast.success('Segmento actualizado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => segmentsService.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.segments.list });
      toast.success('Segmento eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const createSegment = async (payload: SegmentPayload): Promise<boolean> => {
    await createMutation.mutateAsync(payload);
    return true;
  };

  const updateSegment = async (uid: string, payload: Partial<SegmentPayload>): Promise<boolean> => {
    await updateMutation.mutateAsync({ uid, payload });
    return true;
  };

  const deleteSegment = async (uid: string): Promise<boolean> => {
    await deleteMutation.mutateAsync(uid);
    return true;
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
