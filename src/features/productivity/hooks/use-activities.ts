'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { productivityService } from '../services/productivity.service';
import type { ActivityPayload, ActivityStatus } from '../types/productivity.types';

export function useActivities(contactUid?: string) {
  const queryClient = useQueryClient();

  const queryKey = contactUid
    ? queryKeys.productivity.activities.byContact(contactUid)
    : queryKeys.productivity.activities.all;

  const { data: activities = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => productivityService.listActivities(contactUid),
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
  };
}
