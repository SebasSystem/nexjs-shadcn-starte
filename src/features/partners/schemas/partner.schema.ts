import { z } from 'zod';

export const partnerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['distributor', 'reseller', 'ally']),
  status: z.enum(['active', 'inactive', 'prospect']),
  region: z.string().min(1, 'La región es requerida'),
  contact_name: z.string().min(1, 'El nombre de contacto es requerido'),
  contact_email: z.string().min(1, 'El email es requerido').email('Formato de email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  joined_date: z.string().min(1, 'La fecha de ingreso es requerida'),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;
