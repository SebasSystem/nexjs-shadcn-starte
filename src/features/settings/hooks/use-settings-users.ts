'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { usersService } from '../services/users.service';
import type { SettingsUser } from '../types/settings.types';

const generatePassword = () => Math.random().toString(36).slice(-10) + 'A1!';

interface UserFilters {
  search?: string;
  role_uid?: string;
  estado?: string;
}

export function useSettingsUsers(filters: UserFilters = {}) {
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pagination = usePaginationParams();
  const { params, setTotal } = pagination;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersService.getAll({
        ...params,
        ...(filters.search && { search: filters.search }),
        ...(filters.role_uid && { role_uid: filters.role_uid }),
        ...(filters.estado && { estado: filters.estado }),
      });
      const meta = extractPaginationMeta(res);
      if (meta) setTotal(meta.total);
      setUsers(((res as unknown as { data?: SettingsUser[] }).data ?? []) as SettingsUser[]);
    } finally {
      setIsLoading(false);
    }
  }, [params, setTotal, filters.search, filters.role_uid, filters.estado]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (
    data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_login_at'> & {
      password?: string;
      role_uid?: string;
    }
  ): Promise<boolean> => {
    try {
      const payload = { ...data, password: data.password || generatePassword() };
      const newUser = await usersService.create(payload as unknown as SettingsUser);
      if (data.role_uid) {
        await usersService.assignRole(newUser.uid, data.role_uid as string).catch(() => {});
      }
      await fetchUsers();
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = async (
    id: string,
    data: Partial<SettingsUser> & { role_uid?: string }
  ): Promise<boolean> => {
    try {
      await usersService.update(id, data);
      if (data.role_uid !== undefined) {
        const oldUser = users.find((u) => u.uid === id);
        if (oldUser?.role_uid && oldUser.role_uid !== data.role_uid) {
          await usersService.removeRole(id, oldUser.role_uid).catch(() => {});
        }
        if (data.role_uid) {
          await usersService.assignRole(id, data.role_uid).catch(() => {});
        }
      }
      await fetchUsers();
      return true;
    } catch {
      return false;
    }
  };

  const toggleStatus = async (id: string): Promise<void> => {
    const user = users.find((u) => u.uid === id);
    if (!user) return;
    await usersService.toggleStatus(id, user.status);
    await fetchUsers();
  };

  const deleteUser = async (id: string): Promise<void> => {
    await usersService.delete(id);
    await fetchUsers();
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
