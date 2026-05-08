'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { productivityService } from '../services/productivity.service';
import type { Activity, ActivityPayload, ActivityStatus } from '../types/productivity.types';

export function useActivities(contactUid?: string) {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const queryKey = contactUid
    ? queryKeys.productivity.activities.byContact(contactUid)
    : queryKeys.productivity.activities.all;

  const { data: activities = [], isLoading } = useQuery({
    queryKey: [...queryKey, pagination.params],
    queryFn: async () => {
      const res = await productivityService.listActivities(contactUid, pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return ((res as unknown as { data?: Activity[] }).data ?? []) as Activity[];
    },
  });

  const addActivity = async (payload: ActivityPayload): Promise<boolean> => {
    try {
      await productivityService.createActivity(payload);
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch {
      return false;
    }
  };

  const updateStatus = async (uid: string, status: ActivityStatus): Promise<boolean> => {
    try {
      await productivityService.updateActivityStatus(uid, status);
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch {
      return false;
    }
  };

  return {
    data: activities,
    isLoading,
    addActivity,
    updateStatus,
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
