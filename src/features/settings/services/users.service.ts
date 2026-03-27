import { MOCK_SETTINGS_USERS } from 'src/_mock/_settings';
import type { SettingsUser } from '../types/settings.types';

let _users = [...MOCK_SETTINGS_USERS];

export const usersService = {
  getAll: async (): Promise<SettingsUser[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._users];
  },

  create: async (
    data: Omit<SettingsUser, 'id' | 'creadoEn' | 'ultimoAcceso'>
  ): Promise<SettingsUser> => {
    await new Promise((r) => setTimeout(r, 500));
    const newUser: SettingsUser = {
      ...data,
      id: `u${Date.now()}`,
      creadoEn: new Date().toISOString(),
      ultimoAcceso: new Date().toISOString(),
    };
    _users = [..._users, newUser];
    return newUser;
  },

  update: async (id: string, data: Partial<SettingsUser>): Promise<SettingsUser> => {
    await new Promise((r) => setTimeout(r, 500));
    _users = _users.map((u) => (u.id === id ? { ...u, ...data } : u));
    return _users.find((u) => u.id === id)!;
  },

  toggleEstado: async (id: string): Promise<SettingsUser> => {
    await new Promise((r) => setTimeout(r, 400));
    _users = _users.map((u) =>
      u.id === id ? { ...u, estado: u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' } : u
    );
    return _users.find((u) => u.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _users = _users.filter((u) => u.id !== id);
  },
};
