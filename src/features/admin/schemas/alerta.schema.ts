import { z } from 'zod';

export const alertaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  metric: z.enum(['errores', 'warnings', 'latencia', 'uptime']),
  operator: z.enum(['>', '<', '>=', '<=']),
  value: z.number().min(0, 'El valor debe ser mayor a 0'),
  period: z.enum(['1h', '6h', '24h', '7d']),
  canal: z.array(z.enum(['EMAIL', 'SLACK', 'PUSH'])).min(1, 'Selecciona al menos un canal'),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
});

export type AlertaFormData = z.infer<typeof alertaSchema>;
