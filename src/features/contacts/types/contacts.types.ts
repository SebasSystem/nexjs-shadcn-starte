// ─────────────────────────────────────────────────────────────────────────────
// Contacts — Tipos del dominio
// ─────────────────────────────────────────────────────────────────────────────

export type TipoEntidad = 'B2B' | 'B2C' | 'B2G';
export type EstadoContacto = 'ACTIVO' | 'INACTIVO' | 'PROSPECTO';
export type TamanoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIANA' | 'GRANDE';

/** Relación entre dos entidades (contacto ↔ empresa) */
export interface RelacionEntidad {
  entidadId: string;
  entidadNombre: string;
  entidadTipo: TipoEntidad;
  cargo?: string;
}

/** Entidad base — campos comunes a B2B, B2C y B2G */
interface ContactoBase {
  id: string;
  tipo: TipoEntidad;
  nombre: string;
  email: string;
  telefono?: string;
  pais: string;
  ciudad?: string;
  estado: EstadoContacto;
  relaciones: RelacionEntidad[];
  creadoEn: string;
}

/** B2B — Empresa */
export interface ContactoEmpresa extends ContactoBase {
  tipo: 'B2B';
  nit: string;
  sector?: string;
  tamano?: TamanoEmpresa;
  sitioWeb?: string;
}

/** B2C — Persona natural */
export interface ContactoPersona extends ContactoBase {
  tipo: 'B2C';
  cedula?: string;
  cargo?: string;
  /** ID de empresa B2B a la que pertenece */
  empresaId?: string;
  empresaNombre?: string;
}

/** B2G — Institución pública */
export interface ContactoInstitucion extends ContactoBase {
  tipo: 'B2G';
  tipoInstitucion?: string;
  entidadPublica: boolean;
  codigoLicitacion?: string;
}

export type Contacto = ContactoEmpresa | ContactoPersona | ContactoInstitucion;

/** Payload para crear/editar — campos unificados */
export interface ContactoForm {
  id?: string;
  tipo: TipoEntidad;
  nombre: string;
  email: string;
  telefono?: string;
  pais: string;
  ciudad?: string;
  estado: EstadoContacto;
  // B2B
  nit?: string;
  sector?: string;
  tamano?: TamanoEmpresa;
  sitioWeb?: string;
  // B2C
  cedula?: string;
  cargo?: string;
  empresaId?: string;
  // B2G
  tipoInstitucion?: string;
  entidadPublica?: boolean;
  codigoLicitacion?: string;
}
