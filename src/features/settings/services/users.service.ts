import axiosInstance, { endpoints } from 'src/lib/axios';

import type { SettingsUser } from '../types/settings.types';

function mapUser(raw: Record<string, unknown>): SettingsUser {
  const lockedUntil = raw.locked_until ? new Date(raw.locked_until as string) : null;
  const isLocked = lockedUntil && lockedUntil > new Date();

  return {
    uid: raw.uid as string,
    name: raw.name as string,
    email: raw.email as string,
    role_uid: '',
    role_name: '',
    status: isLocked ? 'INACTIVO' : 'ACTIVO',
    last_access_at: (raw.last_login_at as string) ?? '',
    created_at: (raw.created_at as string) ?? '',
  };
}

export const usersService = {
  async getAll(): Promise<SettingsUser[]> {
    const res = await axiosInstance.get(endpoints.users.list);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapUser);
  },

  // POST /users — pending backend routing. Optimistic stub for now.
  async create(
    data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_access_at'>
  ): Promise<SettingsUser> {
    const res = await axiosInstance.post(endpoints.users.create, {
      name: data.name,
      email: data.email,
      password: (data as Record<string, unknown>).password ?? '',
    });
    const payload = res.data?.data ?? res.data;
    return mapUser(payload);
  },

  // PUT /users/{uid} — pending backend routing.
  async update(id: string, data: Partial<SettingsUser>): Promise<SettingsUser> {
    const res = await axiosInstance.put(endpoints.users.update(id), {
      name: data.name,
      email: data.email,
    });
    const payload = res.data?.data ?? res.data;
    return mapUser(payload);
  },

  // No toggle-status endpoint — optimistic local
  async toggleStatus(id: string): Promise<SettingsUser> {
    const users = await usersService.getAll();
    const user = users.find((u) => u.uid === id);
    if (!user) throw new Error('Usuario no encontrado');
    return { ...user, status: user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' };
  },

  // DELETE /users/{uid} — pending backend routing.
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
