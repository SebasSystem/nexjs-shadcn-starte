import type {
  Interaccion,
  Actividad,
  Documento,
  TipoActividad,
  EstadoActividad,
} from '../types/productividad.types';

// Mock initial data
let inMemoryInteracciones: Interaccion[] = [
  {
    id: '1',
    contactoId: '1',
    tipo: 'SISTEMA',
    contenido: 'El contacto fue creado en el sistema.',
    autor: 'admin@empresa.com',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '2',
    contactoId: '1',
    tipo: 'NOTA',
    contenido: 'Cliente interesado en los servicios de consultoría B2B.',
    autor: 'asesor@empresa.com',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    contactoId: '1',
    tipo: 'LLAMADA',
    contenido: 'No contestó. Dejé buzón de voz.',
    autor: 'asesor@empresa.com',
    fecha: new Date().toISOString(),
  },
  {
    id: '4',
    contactoId: '2',
    tipo: 'CORREO',
    contenido: 'Se envió la propuesta comercial v1.0',
    autor: 'ventas@empresa.com',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

let inMemoryActividades: Actividad[] = [
  {
    id: '1',
    contactoId: '1',
    contactoNombre: 'Tech Corp (B2B)',
    tipo: 'TAREA',
    titulo: 'Enviar cotización detallada',
    descripcion: 'Incluir desglose de servicios de consultoría solicitados.',
    estado: 'PENDIENTE',
    fechaVencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // +1 day
    asignadoA: 'Juan Díaz',
  },
  {
    id: '2',
    contactoId: '2',
    contactoNombre: 'María Rodríguez (B2C)',
    tipo: 'LLAMADA' as TipoActividad, // Fallback as a generic TAREA for frontend ease
    titulo: 'Llamada de seguimiento',
    estado: 'VENCIDA',
    fechaVencimiento: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // -1 day
    asignadoA: 'Juan Díaz',
  },
  {
    id: '3',
    tipo: 'REUNION',
    titulo: 'Reunión de alineación de ventas Q2',
    descripcion: 'Analizar pipeline global y leads en riesgo',
    estado: 'COMPLETADA',
    fechaVencimiento: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    asignadoA: 'Juan Díaz',
  },
];

let inMemoryDocumentos: Documento[] = [
  {
    id: '1',
    contactoId: '1',
    nombreArchivo: 'NDA_TechCorp.pdf',
    url: '#',
    tamanoBytes: 1048576, // 1MB
    mimeType: 'application/pdf',
    subidoPor: 'asesor@empresa.com',
    fechaSubida: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

// Helper delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ProductividadService = {
  // INTERACCIONES
  async getInteracciones(contactoId: string): Promise<Interaccion[]> {
    await delay(300);
    return inMemoryInteracciones
      .filter((i) => i.contactoId === contactoId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },
  async createInteraccion(data: Omit<Interaccion, 'id' | 'autor' | 'fecha'>): Promise<Interaccion> {
    await delay(400);
    const newInteraction: Interaccion = {
      ...data,
      id: crypto.randomUUID(),
      autor: 'usuario_actual',
      fecha: new Date().toISOString(),
    };
    inMemoryInteracciones = [newInteraction, ...inMemoryInteracciones];
    return newInteraction;
  },

  // ACTIVIDADES
  async getActividades(contactoId?: string): Promise<Actividad[]> {
    await delay(300);
    let results = inMemoryActividades;
    if (contactoId) {
      results = results.filter((a) => a.contactoId === contactoId);
    }
    return results.sort(
      (a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
    );
  },
  async createActividad(data: Omit<Actividad, 'id' | 'estado' | 'asignadoA'>): Promise<Actividad> {
    await delay(400);
    const newActividad: Actividad = {
      ...data,
      id: crypto.randomUUID(),
      estado: 'PENDIENTE',
      asignadoA: 'Juan Díaz',
    };
    inMemoryActividades = [newActividad, ...inMemoryActividades];
    return newActividad;
  },
  async updateActividadEstado(id: string, estado: EstadoActividad): Promise<void> {
    await delay(300);
    inMemoryActividades = inMemoryActividades.map((a) => (a.id === id ? { ...a, estado } : a));
  },

  // BÓVEDA DOCUMENTAL
  async getDocumentos(contactoId: string): Promise<Documento[]> {
    await delay(300);
    return inMemoryDocumentos
      .filter((d) => d.contactoId === contactoId)
      .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime());
  },
  async uploadDocumento(contactoId: string, file: File): Promise<Documento> {
    await delay(600); // simulate upload
    if (file.type !== 'application/pdf') {
      throw new Error('Solo se permiten archivos PDF');
    }
    const newDoc: Documento = {
      id: crypto.randomUUID(),
      contactoId,
      nombreArchivo: file.name,
      url: URL.createObjectURL(file), // Mock URL
      tamanoBytes: file.size,
      mimeType: file.type,
      subidoPor: 'usuario_actual',
      fechaSubida: new Date().toISOString(),
    };
    inMemoryDocumentos = [newDoc, ...inMemoryDocumentos];
    return newDoc;
  },
  async deleteDocumento(id: string): Promise<void> {
    await delay(300);
    inMemoryDocumentos = inMemoryDocumentos.filter((d) => d.id !== id);
  },
};
