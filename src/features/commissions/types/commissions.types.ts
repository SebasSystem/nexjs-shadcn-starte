export type TipoComision = 'VENTA' | 'MARGEN' | 'META';
export type EstadoPlan = 'ACTIVO' | 'INACTIVO';

export interface TramoComision {
  id: string;
  desde: number;
  hasta: number | null; // null significa "Sin límite"
  porcentajeAplicado: number;
}

export interface PlanComision {
  id: string;
  nombre: string;
  tipo: TipoComision;
  porcentajeBase: number;
  tramos: TramoComision[];
  rolesAplicables: string[];
  fechaInicio: string; // ISO date string
  fechaFin?: string; // ISO date string
  estado: EstadoPlan;
}

export type EstadoAsignacion = 'ACTIVO' | 'INACTIVO' | 'SIN_ASIGNAR';

export interface AsignacionPlan {
  id: string;
  vendedorId: string;
  vendedorNombre: string;
  vendedorAvatar?: string;
  equipoId: string;
  equipoNombre: string;
  planId?: string;
  planNombre?: string;
  planTipo?: TipoComision;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoAsignacion;
}

export type EstadoComision = 'PENDIENTE' | 'APROBADO' | 'PAGADO';

export interface RegistroComision {
  id: string;
  vendedorId: string;
  vendedorNombre: string;
  vendedorAvatar?: string;
  equipoId: string;
  periodo: string; // Ej: "Febrero 2025"
  ventasPeriodo: number;
  planAplicado: string;
  comisionCalculada: number;
  estado: EstadoComision;
}
