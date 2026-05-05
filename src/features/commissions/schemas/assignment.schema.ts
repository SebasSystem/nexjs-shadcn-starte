import { z } from 'zod';

export const assignmentSchema = z.object({
  uid: z.string().optional(),
  user_uid: z.string().min(1, 'Debes seleccionar un vendedor'),
  user_name: z.string().optional(),
  team_uid: z.string().min(1, 'El equipo es requerido'),
  team_name: z.string().optional(),
  plan_uid: z.string().min(1, 'Debes seleccionar un plan de comisión'),
  plan_name: z.string().optional(),
  start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
  end_date: z.string().optional(),
  status: z.enum(['ACTIVO', 'INACTIVO', 'SIN_ASIGNAR']),
});

export type AssignmentForm = z.infer<typeof assignmentSchema>;
