import { z } from 'zod';

export const activitySchema = z.object({
  contact_uid: z.string().optional(),
  contact_name: z.string().optional(),
  type: z.enum(['TASK', 'REMINDER', 'MEETING']),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'La fecha es requerida'),
  assigned_to_name: z.string().optional(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;
