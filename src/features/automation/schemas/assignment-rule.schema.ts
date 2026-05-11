import { z } from 'zod';

export const assignmentRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['round_robin', 'geographic', 'manual']),
  description: z.string().optional(),
  user_ids: z.array(z.string()),
  geo_mapping: z.record(z.string(), z.array(z.string())).optional(),
  enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type AssignmentRuleFormData = z.infer<typeof assignmentRuleSchema>;
