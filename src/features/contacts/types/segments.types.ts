export type FieldType = 'tipo' | 'etiqueta' | 'estado' | 'fecha_creacion';

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in';

export interface Rule {
  id: string;
  field: FieldType;
  operator: Operator;
  value: string | number | string[];
}

export interface Segment {
  id: string;
  nombre: string;
  descripcion: string;
  reglas: Rule[];
  logica: 'AND' | 'OR';
  totalContactos: number; // Métrica analítica rápida
  creadoEn: string;
  ultimaActualizacion: string;
}

export interface SegmentForm {
  nombre: string;
  descripcion: string;
  reglas: Rule[];
  logica: 'AND' | 'OR';
}
