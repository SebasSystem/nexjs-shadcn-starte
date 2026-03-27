'use client';

import { useState, useEffect, useCallback } from 'react';
import { rolesService } from '../services/roles.service';
import type { Rol } from '../types/settings.types';

export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([]);
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

  const createRol = async (
    data: Omit<Rol, 'id' | 'creadoEn' | 'totalUsuarios'>
  ): Promise<boolean> => {
    try {
      const newRol = await rolesService.create(data);
      setRoles((prev) => [...prev, newRol]);
      return true;
    } catch {
      return false;
    }
  };

  const updateRol = async (id: string, data: Partial<Rol>): Promise<boolean> => {
    try {
      const updated = await rolesService.update(id, data);
      setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return true;
    } catch {
      return false;
    }
  };

  const deleteRol = async (id: string): Promise<void> => {
    await rolesService.delete(id);
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return { roles, isLoading, createRol, updateRol, deleteRol, refetch: fetchRoles };
}
