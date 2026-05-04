'use client';

import { useCallback, useEffect, useState } from 'react';

import { teamsService } from '../services/teams.service';
import type { Equipo, MiembroEquipo } from '../types/settings.types';

export function useTeams() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEquipos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teamsService.getAll();
      setEquipos(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  const createEquipo = async (
    data: Omit<Equipo, 'id' | 'creadoEn' | 'totalMiembros' | 'miembros'>
  ): Promise<boolean> => {
    try {
      const newEquipo = await teamsService.create(data);
      setEquipos((prev) => [...prev, newEquipo]);
      return true;
    } catch {
      return false;
    }
  };

  const updateEquipo = async (id: string, data: Partial<Equipo>): Promise<boolean> => {
    try {
      const updated = await teamsService.update(id, data);
      setEquipos((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return true;
    } catch {
      return false;
    }
  };

  const addMember = async (equipoId: string, miembro: MiembroEquipo): Promise<void> => {
    const updated = await teamsService.addMember(equipoId, miembro);
    setEquipos((prev) => prev.map((e) => (e.id === equipoId ? updated : e)));
  };

  const removeMember = async (equipoId: string, usuarioId: string): Promise<void> => {
    const updated = await teamsService.removeMember(equipoId, usuarioId);
    setEquipos((prev) => prev.map((e) => (e.id === equipoId ? updated : e)));
  };

  const deleteEquipo = async (id: string): Promise<void> => {
    await teamsService.delete(id);
    setEquipos((prev) => prev.filter((e) => e.id !== id));
  };

  return { equipos, isLoading, createEquipo, updateEquipo, addMember, removeMember, deleteEquipo };
}
