import { z } from 'zod';

export const lostReasonSchema = z.object({
  opportunityName: z.string().min(3, 'El nombre del deal es requerido'),
  clientName: z.string().min(2, 'El cliente es requerido'),
  amount: z.number({ error: 'Ingresá un monto válido' }).positive('El monto debe ser mayor a 0'),
  currency: z.enum(['USD', 'COP', 'MXN']),
  competitorId: z.string().optional(),
  lostReasonCategory: z.string().min(1, 'Seleccioná una razón'),
  lostReasonDetail: z.string().min(10, 'Detallá la razón con al menos 10 caracteres'),
  lostDate: z.string().min(1, 'La fecha de pérdida es requerida'),
  salesRepName: z.string().min(2, 'El vendedor responsable es requerido'),
});

export type LostReasonFormData = z.infer<typeof lostReasonSchema>;
