import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  category_uid: z.string().optional(),
  description: z.string().optional(),
  reorder_point: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  warehouse_stocks: z
    .array(
      z.object({
        warehouse_uid: z.string().min(1),
        quantity: z.number().int().min(0, 'No puede ser negativo'),
      })
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
