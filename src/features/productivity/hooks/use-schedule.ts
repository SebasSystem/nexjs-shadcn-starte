'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import {
  type ScheduleItem,
  type ScheduleParams,
  scheduleService,
} from '../services/schedule.service';

// ─── Hook ──────────────────────────────────────────────────────────────────

interface UseScheduleOptions {
  status?: string;
  source?: string;
}

export function useSchedule(filters: UseScheduleOptions = {}) {
  const pagination = usePaginationParams();

  const params: ScheduleParams = {
    ...pagination.params,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.source ? { source: filters.source } : {}),
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['schedule', params],
    queryFn: async () => {
      const res = await scheduleService.list(params);
      const meta = extractPaginationMeta(res as unknown as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return res as unknown as ScheduleItem[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  return {
    items,
    isLoading,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      search: pagination.search,
      onChangeSearch: pagination.onChangeSearch,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
