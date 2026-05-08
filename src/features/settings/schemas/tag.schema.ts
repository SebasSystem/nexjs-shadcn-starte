import { z } from 'zod';

const tagColorEnum = z.enum([
  'blue',
  'red',
  'green',
  'yellow',
  'purple',
  'orange',
  'slate',
  'pink',
]);

const tagEntityEnum = z.enum(['CONTACT', 'DEAL', 'LEAD', 'COMPANY']);

export const tagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  color: tagColorEnum,
  entity_types: z.array(tagEntityEnum).min(1, 'Al menos una entidad requerida'),
});

export type TagFormData = z.infer<typeof tagSchema>;
