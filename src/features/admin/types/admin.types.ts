export type EstadoTenant = 'ACTIVO' | 'TRIAL' | 'VENCIDO' | 'SUSPENDIDO' | 'INACTIVO';
export type EstadoFactura = 'PAGADA' | 'PENDIENTE' | 'VENCIDA' | 'CANCELADA';
export type TierPlan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type SoportePlan = 'EMAIL' | 'EMAIL_CHAT' | 'DEDICADO';

export interface Tenant {
  id: string;
  nombre: string;
  dominio: string;
  pais: string;
  emailContacto: string;
  planId: string;
  planNombre: string;
  mrr: number;
  estado: EstadoTenant;
  totalUsuarios: number;
  limiteUsuarios: number;
  almacenamientoUsadoGB: number;
  limiteAlmacenamientoGB: number;
  creadoEn: string;
  ultimoAcceso: string;
}

export interface FeaturesPlan {
  limiteUsuarios: number | null;
  almacenamientoGB: number | null;
  apiCallsMes: number | null;
  modulos: string[];
  soporte: SoportePlan;
  slaUptime: number | null;
  customDomain: boolean;
  sso: boolean;
  reportesAvanzados: boolean;
}

export interface PlanSaaS {
  id: string;
  nombre: string;
  tier: TierPlan;
  precio: number;
  intervalo: 'MENSUAL' | 'ANUAL';
  estado: 'ACTIVO' | 'INACTIVO' | 'LEGADO';
  features: FeaturesPlan;
  totalTenants: number;
  creadoEn: string;
}

export interface Factura {
  id: string;
  tenantId: string;
  tenantNombre: string;
  periodo: string;
  planNombre: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoFactura;
  fechaEmision: string;
  fechaVencimiento: string;
}

export interface LogEntry {
  id: string;
  tenantId: string;
  tenantNombre: string;
  nivel: 'ERROR' | 'WARN' | 'INFO';
  mensaje: string;
  timestamp: string;
  errores24h?: number;
  severidad?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
}

export interface Alerta {
  id: string;
  nombre: string;
  condicion: string;
  canal: ('EMAIL' | 'SLACK' | 'PUSH')[];
  estado: 'ACTIVO' | 'INACTIVO';
  ultimaActivacion: string | null;
}
