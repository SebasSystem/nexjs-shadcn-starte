import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/i, 'Solo letras, números, guiones y guiones bajos'),
  location: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
