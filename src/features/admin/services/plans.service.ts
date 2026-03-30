import { PlanSaaS } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_PLANES: PlanSaaS[] = [
  {
    id: 'plan-starter',
    nombre: 'Plan Starter',
    tier: 'STARTER',
    precio: 49,
    intervalo: 'MENSUAL',
    estado: 'ACTIVO',
    features: {
      limiteUsuarios: 5,
      almacenamientoGB: 10,
      apiCallsMes: 10000,
      modulos: ['ventas'],
      soporte: 'EMAIL',
      slaUptime: null,
      customDomain: false,
      sso: false,
      reportesAvanzados: false,
    },
    totalTenants: 28,
    creadoEn: '2023-01-01',
  },
  {
    id: 'plan-pro',
    nombre: 'Plan Pro',
    tier: 'PRO',
    precio: 149,
    intervalo: 'MENSUAL',
    estado: 'ACTIVO',
    features: {
      limiteUsuarios: 25,
      almacenamientoGB: 50,
      apiCallsMes: 100000,
      modulos: ['ventas', 'inventario', 'rh'],
      soporte: 'EMAIL_CHAT',
      slaUptime: 99.9,
      customDomain: true,
      sso: false,
      reportesAvanzados: true,
    },
    totalTenants: 86,
    creadoEn: '2023-01-01',
  },
  {
    id: 'plan-business',
    nombre: 'Plan Business',
    tier: 'BUSINESS',
    precio: 349,
    intervalo: 'MENSUAL',
    estado: 'ACTIVO',
    features: {
      limiteUsuarios: 100,
      almacenamientoGB: 200,
      apiCallsMes: 1000000,
      modulos: ['ventas', 'inventario', 'rh', 'reportes', 'multi-currency'],
      soporte: 'EMAIL_CHAT',
      slaUptime: 99.9,
      customDomain: true,
      sso: true,
      reportesAvanzados: true,
    },
    totalTenants: 22,
    creadoEn: '2023-06-01',
  },
  {
    id: 'plan-enterprise',
    nombre: 'Enterprise',
    tier: 'ENTERPRISE',
    precio: 999,
    intervalo: 'MENSUAL',
    estado: 'ACTIVO',
    features: {
      limiteUsuarios: null,
      almacenamientoGB: null,
      apiCallsMes: null,
      modulos: ['ventas', 'inventario', 'rh', 'reportes', 'multi-currency', 'api-publica'],
      soporte: 'DEDICADO',
      slaUptime: 99.99,
      customDomain: true,
      sso: true,
      reportesAvanzados: true,
    },
    totalTenants: 8,
    creadoEn: '2024-01-01',
  },
];

let planesData: PlanSaaS[] = [...MOCK_PLANES];

export const plansService = {
  async getAll(): Promise<PlanSaaS[]> {
    await delay(500);
    return [...planesData];
  },

  async getById(id: string): Promise<PlanSaaS | undefined> {
    await delay(500);
    return planesData.find((p) => p.id === id);
  },

  async create(data: Omit<PlanSaaS, 'id' | 'creadoEn' | 'totalTenants'>): Promise<PlanSaaS> {
    await delay(500);
    const newPlan: PlanSaaS = {
      ...data,
      id: `plan-${Date.now()}`,
      totalTenants: 0,
      creadoEn: new Date().toISOString().split('T')[0],
    };
    planesData = [...planesData, newPlan];
    return newPlan;
  },

  async update(id: string, data: Partial<PlanSaaS>): Promise<PlanSaaS> {
    await delay(500);
    planesData = planesData.map((p) => (p.id === id ? { ...p, ...data } : p));
    return planesData.find((p) => p.id === id)!;
  },
};
