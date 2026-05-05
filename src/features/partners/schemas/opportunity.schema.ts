import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'COP', 'MXN']);
const statusEnum = z.enum(['pending', 'approved', 'rejected', 'converted', 'lost']);

export const opportunitySchema = z.object({
  partner_uid: z.string().min(1, 'El partner es requerido'),
  client_name: z.string().min(1, 'El nombre del cliente es requerido'),
  client_email: z.string().email('Email inválido').optional().or(z.literal('')),
  product: z.string().min(1, 'El producto/servicio es requerido'),
  estimated_value: z.coerce.number().min(0, 'El valor debe ser positivo'),
  currency: currencyEnum,
  status: statusEnum,
  assigned_to_internal: z.string().optional(),
  notes: z.string().optional(),
});

export type OpportunityFormData = z.infer<typeof opportunitySchema>;
