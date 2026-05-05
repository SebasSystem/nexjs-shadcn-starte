import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  client_uid: z.string().min(1, 'Seleccioná un cliente'),
  client_name: z.string().optional(),
  manager: z.string().min(1, 'Seleccioná un manager'),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin estimado es requerida'),
  description: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
