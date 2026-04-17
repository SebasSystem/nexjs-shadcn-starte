import { z } from 'zod';

export const strengthItemSchema = z.object({
  value: z.string().min(3, 'Ingresá al menos 3 caracteres'),
});

export const objectionSchema = z.object({
  id: z.string().optional(),
  objection: z.string().min(5, 'Describí la objeción del cliente'),
  response: z.string().min(10, 'Escribí la respuesta del vendedor'),
});

export const battlecardSchema = z.object({
  competitorId: z.string().min(1, 'Seleccioná un competidor'),
  summary: z.string().min(10, 'Escribí el posicionamiento en al menos 10 caracteres'),
  ourStrengths: z.array(strengthItemSchema).min(1, 'Agregá al menos una ventaja diferencial'),
  theirStrengths: z
    .array(strengthItemSchema)
    .min(1, 'Agregá al menos una fortaleza del competidor'),
  objections: z.array(objectionSchema).min(1, 'Agregá al menos una objeción con su respuesta'),
});

export type BattlecardFormData = z.infer<typeof battlecardSchema>;
