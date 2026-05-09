import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  tier: z.enum(['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE']),
  billing_interval: z.enum(['MENSUAL', 'ANUAL']),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  status: z.enum(['ACTIVO', 'INACTIVO', 'LEGADO']),
  max_users: z.number().min(0).nullable(),
  ilimitado_usuarios: z.boolean(),
  storage_gb: z.number().min(0).nullable(),
  ilimitado_almacenamiento: z.boolean(),
  api_calls_month: z.number().min(0).nullable(),
  ilimitado_api: z.boolean(),
  modules: z.array(z.string()),
  support_type: z.enum(['EMAIL', 'EMAIL_CHAT', 'DEDICADO']),
  custom_domain: z.boolean(),
  sso: z.boolean(),
  advanced_reports: z.boolean(),
  sla_uptime: z.number().min(0).max(100).nullable(),
});

export type PlanFormData = z.infer<typeof planSchema>;
