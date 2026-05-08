'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { usersService } from '../services/users.service';
import type { SettingsUser } from '../types/settings.types';

// TODO: migrate to TanStack Query for consistency with other hooks
export function useSettingsUsers() {
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pagination = usePaginationParams();
  const { params, setTotal } = pagination;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersService.getAll(params);
      const meta = extractPaginationMeta(res);
      if (meta) setTotal(meta.total);
      setUsers(((res as unknown as { data?: SettingsUser[] }).data ?? []) as SettingsUser[]);
    } finally {
      setIsLoading(false);
    }
  }, [params, setTotal]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (
    data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_login_at'>
  ): Promise<boolean> => {
    try {
      const newUser = await usersService.create(data);
      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = async (id: string, data: Partial<SettingsUser>): Promise<boolean> => {
    try {
      const updated = await usersService.update(id, data);
      setUsers((prev) => prev.map((u) => (u.uid === id ? updated : u)));
      return true;
    } catch {
      return false;
    }
  };

  const toggleStatus = async (id: string): Promise<void> => {
    const user = users.find((u) => u.uid === id);
    if (!user) return;
    const updated = await usersService.toggleStatus(id, user.status);
    setUsers((prev) => prev.map((u) => (u.uid === id ? updated : u)));
  };

  const deleteUser = async (id: string): Promise<void> => {
    await usersService.delete(id);
    setUsers((prev) => prev.filter((u) => u.uid !== id));
  };

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    toggleStatus,
    deleteUser,
    refetch: fetchUsers,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
