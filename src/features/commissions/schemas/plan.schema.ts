import { z } from 'zod';

export const tierSchema = z
  .object({
    uid: z.string().optional(),
    threshold: z.number().min(0, 'El monto inicial debe ser mayor o igual a 0'),
    percentage: z
      .number()
      .min(0.01, 'El porcentaje debe ser mayor a 0')
      .max(100, 'El porcentaje máximo es 100%'),
  })
  .refine(
    (_data) => {
      // Single tier is always valid
      return true;
    },
    { message: 'El valor del umbral no es válido', path: ['threshold'] }
  );

export const planSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  type: z.enum(['VENTA', 'MARGEN', 'META'], { message: 'Selecciona un tipo de comisión' }),
  base_percentage: z.number().min(0.01, 'Debe ser mayor a 0').max(100, 'Máximo 100%'),
  applicable_roles: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  status: z.enum(['ACTIVO', 'INACTIVO']),
  tiers: z.array(tierSchema).min(1, 'Debes definir al menos un tramo'),
});

export type PlanForm = z.infer<typeof planSchema>;
