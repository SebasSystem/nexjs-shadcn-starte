import { z } from 'zod';

export const assignmentRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  user_ids: z.array(z.string()),
  logic: z.enum(['AND', 'OR']).optional(),
  is_active: z.boolean().optional(),
});

export type AssignmentRuleFormData = z.infer<typeof assignmentRuleSchema>;
