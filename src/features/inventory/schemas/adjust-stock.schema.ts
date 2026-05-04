import { z } from 'zod';

export const adjustStockSchema = z.object({
  product_uid: z.string().min(1, 'Seleccioná un producto'),
  warehouse_uid: z.string().min(1, 'Seleccioná una bodega'),
  operation: z.enum(['in', 'out', 'set']),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  comment: z.string().optional(),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

export const transferStockSchema = z.object({
  product_uid: z.string().min(1, 'Seleccioná un producto'),
  from_warehouse_uid: z.string().min(1, 'Seleccioná bodega origen'),
  to_warehouse_uid: z.string().min(1, 'Seleccioná bodega destino'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  comment: z.string().optional(),
});

export type TransferStockFormValues = z.infer<typeof transferStockSchema>;
