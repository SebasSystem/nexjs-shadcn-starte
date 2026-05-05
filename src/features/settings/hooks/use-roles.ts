'use client';

import { useCallback, useEffect, useState } from 'react';

import { rolesService } from '../services/roles.service';
import type { Role } from '../types/settings.types';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await rolesService.getAll();
      setRoles(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (
    data: Omit<Role, 'uid' | 'created_at' | 'total_users'>
  ): Promise<boolean> => {
    try {
      const newRole = await rolesService.create(data);
      setRoles((prev) => [...prev, newRole]);
      return true;
    } catch {
      return false;
    }
  };

  const updateRole = async (id: string, data: Partial<Role>): Promise<boolean> => {
    try {
      const updated = await rolesService.update(id, data);
      setRoles((prev) => prev.map((r) => (r.uid === id ? updated : r)));
      return true;
    } catch {
      return false;
    }
  };

  const deleteRole = async (id: string): Promise<void> => {
    await rolesService.delete(id);
    setRoles((prev) => prev.filter((r) => r.uid !== id));
  };

  return { roles, isLoading, createRole, updateRole, deleteRole, refetch: fetchRoles };
}
