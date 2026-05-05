import { z } from 'zod';

export const contactSchema = z.object({
  type: z.enum(['company', 'person', 'government']),
  name: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Requerido'),
  city: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
  // Company
  tax_id: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.enum(['micro', 'small', 'medium', 'large']).optional(),
  website: z.string().optional(),
  // Person
  id_number: z.string().optional(),
  job_title: z.string().optional(),
  company_uid: z.string().optional(),
  // Government
  institution_type: z.string().optional(),
  is_public_entity: z.boolean().optional(),
  bid_code: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
