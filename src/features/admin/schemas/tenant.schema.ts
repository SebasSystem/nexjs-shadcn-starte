import { z } from 'zod';

export const tenantSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  dominio: z.string().min(1, 'El dominio es requerido').max(255),
  pais: z.string().min(1, 'El país es requerido'),
  email_contacto: z.string().email('Email inválido').or(z.literal('')),
  plan_uid: z.string().min(1, 'Selecciona un plan'),
  fecha_inicio: z.string(),
  dias_trial: z.number().min(0),
  admin_nombre: z.string(),
  admin_email: z.string(),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
