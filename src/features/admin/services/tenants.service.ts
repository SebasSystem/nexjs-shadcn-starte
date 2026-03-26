import { Tenant, EstadoTenant } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    nombre: 'Acme Corporation',
    dominio: 'acme.tucrm.com',
    pais: 'México',
    emailContacto: 'admin@acme.com',
    planId: 'plan-pro',
    planNombre: 'Plan Pro',
    mrr: 149,
    estado: 'ACTIVO',
    totalUsuarios: 12,
    limiteUsuarios: 25,
    almacenamientoUsadoGB: 18,
    limiteAlmacenamientoGB: 50,
    creadoEn: '2024-01-15',
    ultimoAcceso: '2025-03-24T10:32:00Z',
  },
  {
    id: 'tenant-2',
    nombre: 'Beta Soluciones',
    dominio: 'beta.tucrm.com',
    pais: 'Colombia',
    emailContacto: 'admin@beta.co',
    planId: 'plan-starter',
    planNombre: 'Plan Starter',
    mrr: 49,
    estado: 'VENCIDO',
    totalUsuarios: 3,
    limiteUsuarios: 5,
    almacenamientoUsadoGB: 2,
    limiteAlmacenamientoGB: 10,
    creadoEn: '2024-06-01',
    ultimoAcceso: '2025-03-20T14:00:00Z',
  },
  {
    id: 'tenant-3',
    nombre: 'Gamma Tech',
    dominio: 'gamma.tucrm.com',
    pais: 'España',
    emailContacto: 'it@gamma.es',
    planId: 'plan-business',
    planNombre: 'Plan Business',
    mrr: 349,
    estado: 'TRIAL',
    totalUsuarios: 8,
    limiteUsuarios: 50,
    almacenamientoUsadoGB: 5,
    limiteAlmacenamientoGB: 200,
    creadoEn: '2025-03-01',
    ultimoAcceso: '2025-03-24T09:15:00Z',
  },
  {
    id: 'tenant-4',
    nombre: 'Delta Comercial',
    dominio: 'delta.tucrm.com',
    pais: 'México',
    emailContacto: 'soporte@delta.mx',
    planId: 'plan-pro',
    planNombre: 'Plan Pro',
    mrr: 149,
    estado: 'SUSPENDIDO',
    totalUsuarios: 18,
    limiteUsuarios: 25,
    almacenamientoUsadoGB: 45,
    limiteAlmacenamientoGB: 50,
    creadoEn: '2023-11-20',
    ultimoAcceso: '2025-03-10T08:00:00Z',
  },
];

let tenantsData: Tenant[] = [...MOCK_TENANTS];

export const tenantsService = {
  async getAll(): Promise<Tenant[]> {
    await delay(500);
    return [...tenantsData];
  },

  async getById(id: string): Promise<Tenant | undefined> {
    await delay(500);
    return tenantsData.find((t) => t.id === id);
  },

  async create(data: Omit<Tenant, 'id' | 'creadoEn' | 'ultimoAcceso'>): Promise<Tenant> {
    await delay(500);
    const newTenant: Tenant = {
      ...data,
      id: `tenant-${Date.now()}`,
      creadoEn: new Date().toISOString().split('T')[0],
      ultimoAcceso: new Date().toISOString(),
    };
    tenantsData = [...tenantsData, newTenant];
    return newTenant;
  },

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    await delay(500);
    tenantsData = tenantsData.map((t) => (t.id === id ? { ...t, ...data } : t));
    return tenantsData.find((t) => t.id === id)!;
  },

  async suspend(id: string): Promise<Tenant> {
    await delay(500);
    tenantsData = tenantsData.map((t) =>
      t.id === id ? { ...t, estado: 'SUSPENDIDO' as EstadoTenant } : t
    );
    return tenantsData.find((t) => t.id === id)!;
  },
};
