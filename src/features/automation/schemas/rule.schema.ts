import { z } from 'zod';

const ruleConditionSchema = z.object({
  id: z.string(),
  field: z.string().min(1, 'El campo es requerido'),
  operator: z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'gt',
    'gte',
    'lt',
    'lte',
    'exists',
    'not_exists',
  ]),
  value: z.union([z.string(), z.number()]),
});

const conditionGroupSchema = z.object({
  id: z.string(),
  logic: z.enum(['AND', 'OR']),
  conditions: z.array(ruleConditionSchema),
});

const automationActionSchema = z.object({
  id: z.string(),
  sequence: z.number(),
  type: z.enum([
    'create_lead',
    'assign_owner',
    'create_activity',
    'update_field',
    'send_notification',
    'apply_tag',
  ]),
  config: z.object({
    assignmentRuleId: z.string().optional(),
    activityType: z.string().optional(),
    activityNotes: z.string().optional(),
    fieldName: z.string().optional(),
    fieldValue: z.union([z.string(), z.number()]).optional(),
    notificationMessage: z.string().optional(),
    notifyUserId: z.string().optional(),
    tag: z.string().optional(),
  }),
});

export const ruleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  triggerSource: z.enum(['crm', 'linkedin', 'facebook', 'time']),
  triggerEvent: z.enum([
    'lead_created',
    'lead_stage_changed',
    'lead_lost',
    'lead_won',
    'lead_stalled',
    'linkedin_message',
    'linkedin_reply',
    'linkedin_connection',
    'facebook_comment',
    'facebook_message',
    'facebook_like',
    'stage_duration_exceeded',
    'inactivity_days',
  ]),
  triggerConfig: z
    .object({
      daysThreshold: z.number().optional(),
      stageId: z.string().optional(),
    })
    .optional(),
  conditionGroups: z.array(conditionGroupSchema),
  actions: z.array(automationActionSchema),
});

export type RuleFormData = z.infer<typeof ruleSchema>;
