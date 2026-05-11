import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Permission, Role } from '../types/settings.types';

type RoleSavePayload = {
  name: string;
  key: string;
  description: string;
  permission_uids: string[];
};

export const rolesService = {
  async getAll(params?: {
    only_active_modules?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.rbac.roles, { params });
    return res.data;
  },

  async create(data: RoleSavePayload): Promise<Role> {
    const res = await axiosInstance.post(endpoints.rbac.roles, {
      name: data.name,
      key: data.key,
      description: data.description,
      permission_uids: data.permission_uids,
    });
    return (res.data?.data ?? res.data) as Role;
  },

  async update(id: string, data: RoleSavePayload): Promise<Role> {
    const res = await axiosInstance.put(endpoints.rbac.role(id), {
      name: data.name,
      key: data.key,
      description: data.description,
      permission_uids: data.permission_uids,
    });
    return (res.data?.data ?? res.data) as Role;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(endpoints.rbac.role(id));
  },

  async getPermissions(params?: Record<string, string>): Promise<Permission[]> {
    const res = await axiosInstance.get(endpoints.rbac.permissions, { params });
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map((p: Record<string, unknown>) => ({
      uid: p.uid as string,
      key: p.key as string,
      module: p.module as string,
      action: p.action as string,
      description: (p.description as string) ?? '',
    }));
  },
};
