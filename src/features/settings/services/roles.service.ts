import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Rol } from '../types/settings.types';

function mapRol(raw: Record<string, unknown>): Rol {
  return {
    id: raw.uid as string,
    nombre: raw.name as string,
    descripcion: (raw.description as string) ?? '',
    totalUsuarios: 0, // no viene en la respuesta del backend
    permisos: [], // se carga por separado con GET /rbac/permissions
    esDefecto: (raw.is_system as boolean) ?? false,
    creadoEn: (raw.created_at as string) ?? new Date().toISOString(),
  };
}

export const rolesService = {
  async getAll(): Promise<Rol[]> {
    const res = await axiosInstance.get(endpoints.rbac.roles);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapRol);
  },

  async create(data: Omit<Rol, 'id' | 'creadoEn' | 'totalUsuarios'>): Promise<Rol> {
    const res = await axiosInstance.post(endpoints.rbac.roles, {
      name: data.nombre,
      description: data.descripcion,
    });
    const payload = res.data?.data ?? res.data;
    return mapRol(payload);
  },

  async update(id: string, data: Partial<Rol>): Promise<Rol> {
    const res = await axiosInstance.put(endpoints.rbac.role(id), {
      name: data.nombre,
      description: data.descripcion,
    });
    const payload = res.data?.data ?? res.data;
    return mapRol(payload);
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
