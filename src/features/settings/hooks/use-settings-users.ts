'use client';

import { useCallback, useEffect, useState } from 'react';

import { usersService } from '../services/users.service';
import type { SettingsUser } from '../types/settings.types';

export function useSettingsUsers() {
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (
    data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_access_at'>
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
    const updated = await usersService.toggleStatus(id);
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
  };
}
