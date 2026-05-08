import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Permission, Role } from '../types/settings.types';

type RoleSavePayload = {
  name: string;
  key: string;
  description: string;
  permission_uids: string[];
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const res = await axiosInstance.get(endpoints.rbac.roles);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []) as Role[];
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

  async getPermissions(): Promise<Permission[]> {
    const res = await axiosInstance.get(endpoints.rbac.permissions);
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
