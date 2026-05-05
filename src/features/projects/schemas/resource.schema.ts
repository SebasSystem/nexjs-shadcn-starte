import { z } from 'zod';

export const resourceSchema = z.object({
  name: z.string().min(1, 'Seleccioná un recurso'),
  role: z.enum(['consultant', 'technician', 'manager', 'support']),
  email: z.string().email('Email inválido'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;
