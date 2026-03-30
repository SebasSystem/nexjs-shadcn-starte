import type { AsignacionPlan } from '../types/commissions.types';

const MOCK_ASIGNACIONES: AsignacionPlan[] = [
  {
    id: 'asg-1',
    vendedorId: 'vend-1',
    vendedorNombre: 'Carlos Martínez',
    equipoId: 'eq-1',
    equipoNombre: 'Ventas Norte',
    planId: 'plan-1',
    planNombre: 'Plan Élite 2025',
    planTipo: 'VENTA',
    fechaInicio: '2025-01-01',
    estado: 'ACTIVO',
  },
  {
    id: 'asg-2',
    vendedorId: 'vend-2',
    vendedorNombre: 'Ana Gómez',
    equipoId: 'eq-2',
    equipoNombre: 'Ventas Sur',
    estado: 'SIN_ASIGNAR',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const asignacionService = {
  getAsignaciones: async (): Promise<AsignacionPlan[]> => {
    await delay(500);
    return [...MOCK_ASIGNACIONES];
  },

  createAsignacion: async (data: Omit<AsignacionPlan, 'id'>): Promise<AsignacionPlan> => {
    await delay(600);
    const nueva: AsignacionPlan = { ...data, id: `asg-${Date.now()}` };
    MOCK_ASIGNACIONES.push(nueva);
    return nueva;
  },

  updateAsignacion: async (id: string, data: Partial<AsignacionPlan>): Promise<AsignacionPlan> => {
    await delay(600);
    const index = MOCK_ASIGNACIONES.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Asignación no encontrada');

    // Si la asignación estaba SIN_ASIGNAR y ahora tiene plan, cambia su estado a ACTIVO
    const updated = { ...MOCK_ASIGNACIONES[index], ...data };
    if (MOCK_ASIGNACIONES[index].estado === 'SIN_ASIGNAR' && data.planId) {
      updated.estado = 'ACTIVO';
    }

    MOCK_ASIGNACIONES[index] = updated;
    return MOCK_ASIGNACIONES[index];
  },
};
