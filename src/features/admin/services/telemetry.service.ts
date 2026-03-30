import { LogEntry, Alerta } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    tenantId: 'tenant-1',
    tenantNombre: 'Acme Corporation',
    nivel: 'ERROR',
    mensaje: 'POST /api/v1/orders → 500 Internal Server Error',
    timestamp: '2025-03-24T10:32:41Z',
    errores24h: 43,
    severidad: 'ALTO',
  },
  {
    id: 'log-2',
    tenantId: 'tenant-2',
    tenantNombre: 'Beta Soluciones',
    nivel: 'WARN',
    mensaje: 'Rate limit alcanzado (10k/mes)',
    timestamp: '2025-03-24T10:31:22Z',
    errores24h: 12,
    severidad: 'MEDIO',
  },
  {
    id: 'log-3',
    tenantId: 'tenant-4',
    tenantNombre: 'Delta Comercial',
    nivel: 'ERROR',
    mensaje: 'GET /api/v1/invoices → 503 Service Unavailable',
    timestamp: '2025-03-24T10:29:05Z',
    errores24h: 78,
    severidad: 'CRITICO',
  },
  {
    id: 'log-4',
    tenantId: 'tenant-3',
    tenantNombre: 'Gamma Tech',
    nivel: 'INFO',
    mensaje: 'Backup completado exitosamente',
    timestamp: '2025-03-24T10:28:00Z',
    errores24h: 2,
    severidad: 'BAJO',
  },
  {
    id: 'log-5',
    tenantId: 'tenant-1',
    tenantNombre: 'Acme Corporation',
    nivel: 'ERROR',
    mensaje: 'Timeout en conexión a base de datos (30s)',
    timestamp: '2025-03-24T10:25:11Z',
    errores24h: 43,
    severidad: 'ALTO',
  },
  {
    id: 'log-6',
    tenantId: 'tenant-2',
    tenantNombre: 'Beta Soluciones',
    nivel: 'WARN',
    mensaje: 'Espacio de almacenamiento al 90% del límite',
    timestamp: '2025-03-24T10:20:00Z',
    errores24h: 12,
    severidad: 'MEDIO',
  },
  {
    id: 'log-7',
    tenantId: 'tenant-4',
    tenantNombre: 'Delta Comercial',
    nivel: 'ERROR',
    mensaje: 'Fallo en autenticación SSO: token expirado',
    timestamp: '2025-03-24T10:15:33Z',
    errores24h: 78,
    severidad: 'CRITICO',
  },
  {
    id: 'log-8',
    tenantId: 'tenant-3',
    tenantNombre: 'Gamma Tech',
    nivel: 'INFO',
    mensaje: 'Usuario admin@gamma.es inició sesión',
    timestamp: '2025-03-24T10:10:00Z',
    errores24h: 2,
    severidad: 'BAJO',
  },
  {
    id: 'log-9',
    tenantId: 'tenant-1',
    tenantNombre: 'Acme Corporation',
    nivel: 'WARN',
    mensaje: 'Latencia elevada en endpoint /products (>2s)',
    timestamp: '2025-03-24T10:05:20Z',
    errores24h: 43,
    severidad: 'ALTO',
  },
  {
    id: 'log-10',
    tenantId: 'tenant-4',
    tenantNombre: 'Delta Comercial',
    nivel: 'ERROR',
    mensaje: 'POST /api/v1/payments → 402 Payment Required',
    timestamp: '2025-03-24T09:58:47Z',
    errores24h: 78,
    severidad: 'CRITICO',
  },
];

const MOCK_ALERTAS: Alerta[] = [
  {
    id: 'alerta-1',
    nombre: 'Errores críticos por hora',
    condicion: 'Si errores > 50 en 1h',
    canal: ['EMAIL', 'SLACK'],
    estado: 'ACTIVO',
    ultimaActivacion: '2025-03-24T08:00:00Z',
  },
  {
    id: 'alerta-2',
    nombre: 'Almacenamiento al límite',
    condicion: 'Si uso de storage > 90%',
    canal: ['EMAIL'],
    estado: 'ACTIVO',
    ultimaActivacion: '2025-03-22T14:00:00Z',
  },
  {
    id: 'alerta-3',
    nombre: 'Tenant sin pago',
    condicion: 'Si factura vence hace más de 5 días',
    canal: ['EMAIL', 'PUSH'],
    estado: 'INACTIVO',
    ultimaActivacion: null,
  },
];

let alertasData: Alerta[] = [...MOCK_ALERTAS];

export const telemetryService = {
  async getLogs(): Promise<LogEntry[]> {
    await delay(500);
    return [...MOCK_LOGS];
  },

  async getAlertas(): Promise<Alerta[]> {
    await delay(500);
    return [...alertasData];
  },

  async toggleAlerta(id: string): Promise<Alerta> {
    await delay(500);
    alertasData = alertasData.map((a) =>
      a.id === id ? { ...a, estado: a.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' } : a
    ) as Alerta[];
    return alertasData.find((a) => a.id === id)!;
  },

  async saveAlerta(data: Omit<Alerta, 'id'>): Promise<Alerta> {
    await delay(500);
    const newAlerta: Alerta = {
      ...data,
      id: `alerta-${Date.now()}`,
    };
    alertasData = [...alertasData, newAlerta];
    return newAlerta;
  },

  async updateAlerta(id: string, data: Partial<Alerta>): Promise<Alerta> {
    await delay(500);
    alertasData = alertasData.map((a) => (a.id === id ? { ...a, ...data } : a));
    return alertasData.find((a) => a.id === id)!;
  },
};
