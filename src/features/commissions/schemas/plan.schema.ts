import { z } from 'zod';

export const tramoSchema = z
  .object({
    id: z.string().optional(),
    desde: z.number().min(0, 'El monto inicial debe ser mayor o igual a 0'),
    hasta: z.union([z.number().positive('El monto final debe ser mayor a 0'), z.null()]),
    porcentajeAplicado: z
      .number()
      .min(0.01, 'El porcentaje debe ser mayor a 0')
      .max(100, 'El porcentaje máximo es 100%'),
  })
  .refine((data) => data.hasta === null || data.hasta > data.desde, {
    message: 'El valor "Hasta" debe ser mayor que el valor "Desde"',
    path: ['hasta'],
  });

export const planComisionSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  tipo: z.enum(['VENTA', 'MARGEN', 'META'], { message: 'Selecciona un tipo de comisión' }),
  porcentajeBase: z.number().min(0.01, 'Debe ser mayor a 0').max(100, 'Máximo 100%'),
  rolesAplicables: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
  tramos: z.array(tramoSchema).min(1, 'Debes definir al menos un tramo'),
});

export type PlanComisionForm = z.infer<typeof planComisionSchema>;
