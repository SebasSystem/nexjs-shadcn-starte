// ─────────────────────────────────────────────────────────────────────────────
// Productividad — Tipos del dominio
// ─────────────────────────────────────────────────────────────────────────────

export type TipoInteraccion = 'NOTA' | 'LLAMADA' | 'CORREO' | 'SISTEMA';

export interface Interaccion {
  id: string;
  contactoId: string;
  tipo: TipoInteraccion;
  contenido: string;
  autor: string;
  fecha: string;
}

export type EstadoActividad = 'PENDIENTE' | 'COMPLETADA' | 'VENCIDA';
export type TipoActividad = 'TAREA' | 'RECORDATORIO' | 'REUNION';

export interface Actividad {
  id: string;
  contactoId?: string;
  contactoNombre?: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  estado: EstadoActividad;
  fechaVencimiento: string;
  asignadoA: string;
}

export interface Documento {
  id: string;
  contactoId: string;
  nombreArchivo: string;
  url: string;
  tamanoBytes: number;
  mimeType: string;
  subidoPor: string;
  fechaSubida: string;
}
