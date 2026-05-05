import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Role } from '../types/settings.types';

function mapRole(raw: Record<string, unknown>): Role {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    description: (raw.description as string) ?? '',
    total_users: 0, // not returned by the backend
    permissions: [], // loaded separately via GET /rbac/permissions
    is_default: (raw.is_system as boolean) ?? false,
    created_at: (raw.created_at as string) ?? new Date().toISOString(),
  };
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const res = await axiosInstance.get(endpoints.rbac.roles);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapRole);
  },

  async create(data: Omit<Role, 'uid' | 'created_at' | 'total_users'>): Promise<Role> {
    const res = await axiosInstance.post(endpoints.rbac.roles, {
      name: data.name,
      description: data.description,
    });
    const payload = res.data?.data ?? res.data;
    return mapRole(payload);
  },

  async update(id: string, data: Partial<Role>): Promise<Role> {
    const res = await axiosInstance.put(endpoints.rbac.role(id), {
      name: data.name,
      description: data.description,
    });
    const payload = res.data?.data ?? res.data;
    return mapRole(payload);
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(endpoints.rbac.role(id));
  },

  async getPermissions(): Promise<
    Array<{ id: string; key: string; module: string; action: string }>
  > {
    const res = await axiosInstance.get(endpoints.rbac.permissions);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map((p: Record<string, unknown>) => ({
      id: p.uid as string,
      key: p.key as string,
      module: p.module as string,
      action: p.action as string,
    }));
  },
};
