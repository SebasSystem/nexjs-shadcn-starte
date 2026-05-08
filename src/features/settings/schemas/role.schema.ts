import { z } from 'zod';

const permissionActionEnum = z.enum(['ver', 'crear', 'editar', 'eliminar']);

export const modulePermissionSchema = z.object({
  module_uid: z.string().min(1, 'Módulo requerido'),
  module_name: z.string().min(1, 'Nombre de módulo requerido'),
  actions: z.array(permissionActionEnum).min(1, 'Al menos un permiso requerido'),
});

export const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  permissions: z.array(modulePermissionSchema).min(1, 'Al menos un permiso requerido'),
  is_system: z.boolean().default(false),
});

export type RoleFormData = z.infer<typeof roleSchema>;
