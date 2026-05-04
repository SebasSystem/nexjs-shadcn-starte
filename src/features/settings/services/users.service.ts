import axiosInstance, { endpoints } from 'src/lib/axios';

import type { SettingsUser } from '../types/settings.types';

function mapUser(raw: Record<string, unknown>): SettingsUser {
  const lockedUntil = raw.locked_until ? new Date(raw.locked_until as string) : null;
  const isLocked = lockedUntil && lockedUntil > new Date();

  return {
    id: raw.uid as string,
    nombre: raw.name as string,
    email: raw.email as string,
    rolId: '',
    rolNombre: '',
    estado: isLocked ? 'INACTIVO' : 'ACTIVO',
    ultimoAcceso: (raw.last_login_at as string) ?? '',
    creadoEn: (raw.created_at as string) ?? '',
  };
}

export const usersService = {
  async getAll(): Promise<SettingsUser[]> {
    const res = await axiosInstance.get(endpoints.users.list);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapUser);
  },

  // POST /users — pendiente de ruteo en backend. Stub optimista por ahora.
  async create(
    data: Omit<SettingsUser, 'id' | 'creadoEn' | 'ultimoAcceso'>
  ): Promise<SettingsUser> {
    const res = await axiosInstance.post(endpoints.users.create, {
      name: data.nombre,
      email: data.email,
      password: (data as Record<string, unknown>).password ?? '',
    });
    const payload = res.data?.data ?? res.data;
    return mapUser(payload);
  },

  // PUT /users/{uid} — pendiente de ruteo en backend.
  async update(id: string, data: Partial<SettingsUser>): Promise<SettingsUser> {
    const res = await axiosInstance.put(endpoints.users.update(id), {
      name: data.nombre,
      email: data.email,
    });
    const payload = res.data?.data ?? res.data;
    return mapUser(payload);
  },

  // No hay endpoint de toggle estado — optimista local
  async toggleEstado(id: string): Promise<SettingsUser> {
    const users = await usersService.getAll();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    return { ...user, estado: user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' };
  },

  // DELETE /users/{uid} — pendiente de ruteo en backend.
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(endpoints.users.delete(id));
  },

  async assignRole(userId: string, roleUid: string): Promise<void> {
    await axiosInstance.post(endpoints.users.assignRole(userId), { role_uid: roleUid });
  },

  async removeRole(userId: string, roleUid: string): Promise<void> {
    await axiosInstance.delete(endpoints.users.removeRole(userId, roleUid));
  },

  async assignPermission(userId: string, permissionUid: string): Promise<void> {
    await axiosInstance.post(endpoints.users.assignPermission(userId), {
      permission_uid: permissionUid,
    });
  },

  async removePermission(userId: string, permissionUid: string): Promise<void> {
    await axiosInstance.delete(endpoints.users.removePermission(userId, permissionUid));
  },

  async getAccess(userId: string): Promise<string[]> {
    const res = await axiosInstance.get(endpoints.users.access(userId));
    const payload = res.data?.data ?? res.data;
    return (payload?.effective_permissions ?? []).map((p: { key: string }) => p.key);
  },
};
