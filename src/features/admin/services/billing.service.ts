import { Factura, EstadoFactura } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_FACTURAS: Factura[] = [
  {
    id: 'INV-2025-0001',
    tenantId: 'tenant-1',
    tenantNombre: 'Acme Corporation',
    periodo: 'Marzo 2025',
    planNombre: 'Plan Pro',
    subtotal: 149,
    impuesto: 23.84,
    total: 172.84,
    estado: 'PAGADA',
    fechaEmision: '2025-03-01',
    fechaVencimiento: '2025-03-31',
  },
  {
    id: 'INV-2025-0002',
    tenantId: 'tenant-2',
    tenantNombre: 'Beta Soluciones',
    periodo: 'Marzo 2025',
    planNombre: 'Plan Starter',
    subtotal: 49,
    impuesto: 7.84,
    total: 56.84,
    estado: 'VENCIDA',
    fechaEmision: '2025-03-01',
    fechaVencimiento: '2025-03-15',
  },
  {
    id: 'INV-2025-0003',
    tenantId: 'tenant-3',
    tenantNombre: 'Gamma Tech',
    periodo: 'Marzo 2025',
    planNombre: 'Plan Business',
    subtotal: 349,
    impuesto: 55.84,
    total: 404.84,
    estado: 'PENDIENTE',
    fechaEmision: '2025-03-01',
    fechaVencimiento: '2025-03-31',
  },
  {
    id: 'INV-2025-0004',
    tenantId: 'tenant-4',
    tenantNombre: 'Delta Comercial',
    periodo: 'Febrero 2025',
    planNombre: 'Plan Pro',
    subtotal: 149,
    impuesto: 23.84,
    total: 172.84,
    estado: 'VENCIDA',
    fechaEmision: '2025-02-01',
    fechaVencimiento: '2025-02-28',
  },
  {
    id: 'INV-2025-0005',
    tenantId: 'tenant-1',
    tenantNombre: 'Acme Corporation',
    periodo: 'Febrero 2025',
    planNombre: 'Plan Pro',
    subtotal: 149,
    impuesto: 23.84,
    total: 172.84,
    estado: 'PAGADA',
    fechaEmision: '2025-02-01',
    fechaVencimiento: '2025-02-28',
  },
  {
    id: 'INV-2025-0006',
    tenantId: 'tenant-3',
    tenantNombre: 'Gamma Tech',
    periodo: 'Febrero 2025',
    planNombre: 'Plan Business',
    subtotal: 349,
    impuesto: 55.84,
    total: 404.84,
    estado: 'CANCELADA',
    fechaEmision: '2025-02-01',
    fechaVencimiento: '2025-02-28',
  },
];

let facturasData: Factura[] = [...MOCK_FACTURAS];

export const billingService = {
  async getAll(): Promise<Factura[]> {
    await delay(500);
    return [...facturasData];
  },

  async marcarPagada(id: string): Promise<Factura> {
    await delay(500);
    facturasData = facturasData.map((f) =>
      f.id === id ? { ...f, estado: 'PAGADA' as EstadoFactura } : f
    );
    return facturasData.find((f) => f.id === id)!;
  },

  async marcarPagadas(ids: string[]): Promise<Factura[]> {
    await delay(500);
    facturasData = facturasData.map((f) =>
      ids.includes(f.id) ? { ...f, estado: 'PAGADA' as EstadoFactura } : f
    );
    return facturasData.filter((f) => ids.includes(f.id));
  },
};
