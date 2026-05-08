import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

import type { SettingsUser } from '../types/settings.types';

const deriveStatus = (raw: Record<string, unknown>): SettingsUser['status'] =>
  raw.locked_until && new Date(raw.locked_until as string) > new Date() ? 'INACTIVO' : 'ACTIVO';

export const usersService = {
  async getAll(params?: PaginationParams): Promise<SettingsUser[]> {
    const res = await axiosInstance.get(endpoints.users.list, { params });
    return res.data; // full response — callers extract .data for the array
  },

  // POST /users
  async create(
    data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_login_at'>
  ): Promise<SettingsUser> {
    const res = await axiosInstance.post(endpoints.users.create, {
      name: data.name,
      email: data.email,
      password: (data as Record<string, unknown>).password || undefined,
      status: data.status,
    });
    const payload = res.data?.data ?? res.data;
    return {
      ...(payload as Record<string, unknown>),
      status: deriveStatus(payload as Record<string, unknown>),
    } as SettingsUser;
  },

  // PUT /users/{uid}
  async update(id: string, data: Partial<SettingsUser>): Promise<SettingsUser> {
    const res = await axiosInstance.put(endpoints.users.update(id), {
      name: data.name,
      email: data.email,
      status: data.status,
    });
    const payload = res.data?.data ?? res.data;
    return {
      ...(payload as Record<string, unknown>),
      status: deriveStatus(payload as Record<string, unknown>),
    } as SettingsUser;
  },

  // Toggle user active/inactive status via backend.
  // TODO: Remove fallback once backend PUT /api/users/{uid} supports is_active field.
  async toggleStatus(uid: string, currentStatus: string): Promise<SettingsUser> {
    try {
      const isActive = currentStatus !== 'ACTIVO';
      const res = await axiosInstance.put(endpoints.users.update(uid), {
        is_active: isActive,
      });
      const data = res.data?.data ?? res.data;
      // If backend responded with is_active, use it; otherwise fall through
      if (data && typeof data.is_active !== 'undefined') {
        return {
          ...(data as Record<string, unknown>),
          status: data.is_active ? 'ACTIVO' : 'INACTIVO',
        } as SettingsUser;
      }
      throw new Error('Backend does not support is_active yet');
    } catch {
      // TODO: Remove this fallback when backend supports is_active
      const res = await usersService.getAll();
      const users = ((res as unknown as { data?: SettingsUser[] }).data ?? []) as SettingsUser[];
      const user = users.find((u) => u.uid === uid);
      if (!user) throw new Error('Usuario no encontrado');
      return {
        ...user,
        status: user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
      };
    }
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
