// Simulamos el servicio HTTP de comisiones - planes
import type { PlanComision } from '../types/commissions.types';

// Mock data en memoria
let MOCK_PLANES: PlanComision[] = [
  {
    id: 'plan-1',
    nombre: 'Plan Élite 2025',
    tipo: 'VENTA',
    porcentajeBase: 3,
    estado: 'ACTIVO',
    fechaInicio: '2025-01-01',
    rolesAplicables: ['Senior', 'Junior'],
    tramos: [
      { id: 'tramo-1-1', desde: 0, hasta: 5000, porcentajeAplicado: 3 },
      { id: 'tramo-1-2', desde: 5001, hasta: 10000, porcentajeAplicado: 5 },
      { id: 'tramo-1-3', desde: 10001, hasta: null, porcentajeAplicado: 8 },
    ],
  },
  {
    id: 'plan-2',
    nombre: 'Plan Intro',
    tipo: 'VENTA',
    porcentajeBase: 2,
    estado: 'ACTIVO',
    fechaInicio: '2025-02-01',
    rolesAplicables: ['Trainee', 'Junior'],
    tramos: [
      { id: 'tramo-2-1', desde: 0, hasta: 2000, porcentajeAplicado: 2 },
      { id: 'tramo-2-2', desde: 2001, hasta: null, porcentajeAplicado: 4 },
    ],
  },
  {
    id: 'plan-3',
    nombre: 'Plan Margen Alto',
    tipo: 'MARGEN',
    porcentajeBase: 5,
    estado: 'INACTIVO',
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    rolesAplicables: ['Senior', 'Gerente'],
    tramos: [
      { id: 'tramo-3-1', desde: 0, hasta: 1000, porcentajeAplicado: 5 },
      { id: 'tramo-3-2', desde: 1001, hasta: null, porcentajeAplicado: 10 },
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const planesService = {
  getPlanes: async (): Promise<PlanComision[]> => {
    await delay(600);
    return [...MOCK_PLANES];
  },

  getPlanById: async (id: string): Promise<PlanComision | undefined> => {
    await delay(300);
    return MOCK_PLANES.find((p) => p.id === id);
  },

  createPlan: async (planData: Omit<PlanComision, 'id'>): Promise<PlanComision> => {
    await delay(800);
    const newPlan: PlanComision = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    MOCK_PLANES.push(newPlan);
    return newPlan;
  },

  updatePlan: async (id: string, planData: Partial<PlanComision>): Promise<PlanComision> => {
    await delay(800);
    const index = MOCK_PLANES.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Plan no encontrado');

    MOCK_PLANES[index] = { ...MOCK_PLANES[index], ...planData };
    return MOCK_PLANES[index];
  },

  deletePlan: async (id: string): Promise<boolean> => {
    await delay(500);
    const initialLength = MOCK_PLANES.length;
    MOCK_PLANES = MOCK_PLANES.filter((p) => p.id !== id);
    return MOCK_PLANES.length !== initialLength;
  },
};
