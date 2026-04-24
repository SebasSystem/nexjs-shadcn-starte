import { z } from 'zod';

export const assignmentRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['round_robin', 'geographic', 'manual']),
  description: z.string().optional(),
  userIds: z.array(z.string()),
  geoMapping: z.record(z.string(), z.array(z.string())).optional(),
});

export type AssignmentRuleFormData = z.infer<typeof assignmentRuleSchema>;
