import { z } from 'zod';

export const tierSchema = z.object({
  uid: z.string().optional(),
  threshold: z.number().min(0, 'El monto inicial debe ser mayor o igual a 0'),
  percent: z
    .number()
    .min(0.01, 'El porcentaje debe ser mayor a 0')
    .max(100, 'El porcentaje máximo es 100%'),
});

export const planSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  type: z.enum(['sale', 'margin', 'target'], { message: 'Selecciona un tipo de comisión' }),
  base_percentage: z.number().min(0.01, 'Debe ser mayor a 0').max(100, 'Máximo 100%'),
  role_uids: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
  starts_at: z.string().min(1, 'La fecha de inicio es requerida'),
  ends_at: z.string().optional(),
  tiers: z.array(tierSchema).min(1, 'Debes definir al menos un tramo'),
});

export type PlanForm = z.infer<typeof planSchema>;
