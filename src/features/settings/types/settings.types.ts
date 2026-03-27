// ─────────────────────────────────────────────────────────────────────────────
// Settings — Tipos del dominio
// ─────────────────────────────────────────────────────────────────────────────

// ── Usuarios ──────────────────────────────────────────────────────────────────
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';

export interface SettingsUser {
  id: string;
  nombre: string;
  email: string;
  rolId: string;
  rolNombre: string;
  equipoId?: string;
  equipoNombre?: string;
  estado: EstadoUsuario;
  ultimoAcceso: string;
  creadoEn: string;
}

// ── Roles y Permisos ──────────────────────────────────────────────────────────
export type AccionPermiso = 'ver' | 'crear' | 'editar' | 'eliminar';

export interface PermisoModulo {
  moduloId: string;
  moduloNombre: string;
  acciones: AccionPermiso[];
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  totalUsuarios: number;
  permisos: PermisoModulo[];
  esDefecto: boolean;
  creadoEn: string;
}

// ── Equipos ───────────────────────────────────────────────────────────────────
export interface MiembroEquipo {
  usuarioId: string;
  usuarioNombre: string;
  rolNombre: string;
  clientesAsignados: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  liderId: string;
  liderNombre: string;
  totalMiembros: number;
  miembros: MiembroEquipo[];
  creadoEn: string;
}

// ── Campos Personalizados ─────────────────────────────────────────────────────
export type TipoCampo = 'texto' | 'numero' | 'fecha' | 'select' | 'booleano';
export type ModuloCampo = 'contactos' | 'empresas' | 'oportunidades' | 'productos';

export interface CampoPersonalizado {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  modulo: ModuloCampo;
  requerido: boolean;
  opciones?: string[];
  creadoEn: string;
}

// ── Localización ──────────────────────────────────────────────────────────────
export interface ConfigLocalizacion {
  zonaHoraria: string;
  moneda: string;
  simboloMoneda: string;
  formatoFecha: string;
  idioma: string;
}
