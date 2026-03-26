import { z } from 'zod';

export const asignacionSchema = z.object({
  id: z.string().optional(),
  vendedorId: z.string().min(1, 'Debes seleccionar un vendedor'),
  vendedorNombre: z.string().optional(),
  equipoId: z.string().min(1, 'El equipo es requerido'),
  equipoNombre: z.string().optional(),
  planId: z.string().min(1, 'Debes seleccionar un plan de comisión'),
  planNombre: z.string().optional(),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SIN_ASIGNAR']),
});

export type AsignacionForm = z.infer<typeof asignacionSchema>;
