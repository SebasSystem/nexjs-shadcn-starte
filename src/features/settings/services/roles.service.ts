import { MOCK_ROLES } from 'src/_mock/_settings';
import type { Rol } from '../types/settings.types';

let _roles = [...MOCK_ROLES];

export const rolesService = {
  getAll: async (): Promise<Rol[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._roles];
  },

  create: async (data: Omit<Rol, 'id' | 'creadoEn' | 'totalUsuarios'>): Promise<Rol> => {
    await new Promise((r) => setTimeout(r, 500));
    const newRol: Rol = {
      ...data,
      id: `r${Date.now()}`,
      totalUsuarios: 0,
      creadoEn: new Date().toISOString(),
    };
    _roles = [..._roles, newRol];
    return newRol;
  },

  update: async (id: string, data: Partial<Rol>): Promise<Rol> => {
    await new Promise((r) => setTimeout(r, 500));
    _roles = _roles.map((r) => (r.id === id ? { ...r, ...data } : r));
    return _roles.find((r) => r.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _roles = _roles.filter((r) => r.id !== id);
  },
};
