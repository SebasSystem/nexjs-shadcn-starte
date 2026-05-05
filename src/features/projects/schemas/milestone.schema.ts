import { z } from 'zod';

export const milestoneSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'La fecha límite es requerida'),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']).optional(),
  assigned_to_uid: z.string().min(1, 'El responsable es requerido'),
  assigned_to_name: z.string().optional(),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
