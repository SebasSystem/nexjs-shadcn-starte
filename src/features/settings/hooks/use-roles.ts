'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';

import { rolesService } from '../services/roles.service';
import type { Role } from '../types/settings.types';

const EMPTY_ROLES: Role[] = [];

export function useRoles() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: roles = EMPTY_ROLES, isLoading } = useQuery({
    queryKey: [...queryKeys.settings.roles, pagination.params],
    staleTime: 0,
    queryFn: async () => {
      const data = await rolesService.getAll({
        only_active_modules: true,
        ...pagination.params,
      });
      // Backend doesn't paginate yet — track total client-side
      pagination.setTotal(data.length);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      key: string;
      description: string;
      permission_uids: string[];
    }) => rolesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; key: string; description: string; permission_uids: string[] };
    }) => rolesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    roles,
    isLoading,
    createRole: async (data: {
      name: string;
      key: string;
      description: string;
      permission_uids: string[];
    }): Promise<boolean> => {
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    updateRole: async (
      id: string,
      data: { name: string; key: string; description: string; permission_uids: string[] }
    ): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      }
    },
    deleteRole: async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.rbac.permissions,
    queryFn: () => rolesService.getPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}
