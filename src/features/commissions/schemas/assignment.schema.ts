import { z } from 'zod';

export const assignmentSchema = z.object({
  uid: z.string().optional(),
  user_uid: z.string().min(1, 'Debes seleccionar un vendedor'),
  user_name: z.string().optional(),
  plan_uid: z.string().min(1, 'Debes seleccionar un plan de comisión'),
  starts_at: z.string().min(1, 'La fecha de inicio es obligatoria'),
  ends_at: z.string().optional(),
});

export type AssignmentForm = z.infer<typeof assignmentSchema>;
