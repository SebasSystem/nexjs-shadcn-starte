'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { commissionService } from '../services/commission.service';
import type { CommissionRun } from '../types/commissions.types';

export const useHistory = () => {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const {
    data: runs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.commissions.runs, pagination.params],
    queryFn: async () => {
      const res = await commissionService.getRuns(pagination.params);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ?? []) as CommissionRun[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: (uid: string) => commissionService.approveRun(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.runs });
    },
    onError: () => toast.error('Error al aprobar'),
  });

  const payMutation = useMutation({
    mutationFn: (uid: string) => commissionService.payRun(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.runs });
    },
    onError: () => toast.error('Error al marcar como pagado'),
  });

  const bulkApprove = async (uids: string[]) => {
    try {
      await Promise.all(uids.map((uid) => approveMutation.mutateAsync(uid)));
      toast.success(`${uids.length} registro(s) aprobado(s)`);
    } catch {
      toast.error('Error al aprobar algunos registros');
    }
  };

  const bulkPay = async (uids: string[]) => {
    try {
      await Promise.all(uids.map((uid) => payMutation.mutateAsync(uid)));
      toast.success(`${uids.length} registro(s) marcado(s) como pagado(s)`);
    } catch {
      toast.error('Error al pagar algunos registros');
    }
  };

  return {
    runs,
    isLoading,
    isError,
    fetchRuns: refetch,
    bulkApprove,
    bulkPay,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
};

// Keep backward-compatible type alias
export type { CommissionRun as RegistroComision };
