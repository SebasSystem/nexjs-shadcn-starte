import { MOCK_EQUIPOS } from 'src/_mock/_settings';
import type { Equipo, MiembroEquipo } from '../types/settings.types';

let _equipos = [...MOCK_EQUIPOS];

export const teamsService = {
  getAll: async (): Promise<Equipo[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._equipos];
  },

  create: async (
    data: Omit<Equipo, 'id' | 'creadoEn' | 'totalMiembros' | 'miembros'>
  ): Promise<Equipo> => {
    await new Promise((r) => setTimeout(r, 500));
    const newEquipo: Equipo = {
      ...data,
      id: `e${Date.now()}`,
      totalMiembros: 0,
      miembros: [],
      creadoEn: new Date().toISOString(),
    };
    _equipos = [..._equipos, newEquipo];
    return newEquipo;
  },

  update: async (id: string, data: Partial<Equipo>): Promise<Equipo> => {
    await new Promise((r) => setTimeout(r, 500));
    _equipos = _equipos.map((e) => (e.id === id ? { ...e, ...data } : e));
    return _equipos.find((e) => e.id === id)!;
  },

  addMember: async (equipoId: string, miembro: MiembroEquipo): Promise<Equipo> => {
    await new Promise((r) => setTimeout(r, 400));
    _equipos = _equipos.map((e) =>
      e.id === equipoId
        ? { ...e, miembros: [...e.miembros, miembro], totalMiembros: e.totalMiembros + 1 }
        : e
    );
    return _equipos.find((e) => e.id === equipoId)!;
  },

  removeMember: async (equipoId: string, usuarioId: string): Promise<Equipo> => {
    await new Promise((r) => setTimeout(r, 400));
    _equipos = _equipos.map((e) =>
      e.id === equipoId
        ? {
            ...e,
            miembros: e.miembros.filter((m) => m.usuarioId !== usuarioId),
            totalMiembros: e.totalMiembros - 1,
          }
        : e
    );
    return _equipos.find((e) => e.id === equipoId)!;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _equipos = _equipos.filter((e) => e.id !== id);
  },
};
