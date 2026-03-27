import { MOCK_CONTACTOS } from 'src/_mock/_contacts';
import type { Contacto, ContactoForm, TipoEntidad } from '../types/contacts.types';

let _contactos: Contacto[] = [...MOCK_CONTACTOS];

function buildContacto(form: ContactoForm, id: string): Contacto {
  const base = {
    id,
    nombre: form.nombre,
    email: form.email,
    telefono: form.telefono,
    pais: form.pais,
    ciudad: form.ciudad,
    estado: form.estado,
    relaciones: [],
    creadoEn: new Date().toISOString(),
  };

  if (form.tipo === 'B2B') {
    return {
      ...base,
      tipo: 'B2B',
      nit: form.nit ?? '',
      sector: form.sector,
      tamano: form.tamano,
      sitioWeb: form.sitioWeb,
    };
  }

  if (form.tipo === 'B2C') {
    const empresa = _contactos.find((c) => c.id === form.empresaId);
    return {
      ...base,
      tipo: 'B2C',
      cedula: form.cedula,
      cargo: form.cargo,
      empresaId: form.empresaId,
      empresaNombre: empresa?.nombre,
    };
  }

  return {
    ...base,
    tipo: 'B2G',
    tipoInstitucion: form.tipoInstitucion,
    entidadPublica: form.entidadPublica ?? true,
    codigoLicitacion: form.codigoLicitacion,
  };
}

export const contactsService = {
  getAll: async (): Promise<Contacto[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._contactos];
  },

  getById: async (id: string): Promise<Contacto | undefined> => {
    await new Promise((r) => setTimeout(r, 200));
    return _contactos.find((c) => c.id === id);
  },

  /** Verifica si ya existe un contacto con el mismo email o NIT (B2B) */
  checkDuplicate: async (
    email: string,
    nit?: string,
    excludeId?: string
  ): Promise<{ emailDuplicate: boolean; nitDuplicate: boolean }> => {
    await new Promise((r) => setTimeout(r, 150));
    const others = _contactos.filter((c) => c.id !== excludeId);
    const emailDuplicate = others.some((c) => c.email.toLowerCase() === email.toLowerCase());
    const nitDuplicate = nit
      ? others.some((c) => c.tipo === 'B2B' && (c as { nit: string }).nit === nit)
      : false;
    return { emailDuplicate, nitDuplicate };
  },

  create: async (form: ContactoForm): Promise<Contacto> => {
    await new Promise((r) => setTimeout(r, 500));
    const newContact = buildContacto(form, `c${Date.now()}`);
    _contactos = [..._contactos, newContact];
    return newContact;
  },

  update: async (id: string, form: Partial<ContactoForm>): Promise<Contacto> => {
    await new Promise((r) => setTimeout(r, 500));
    _contactos = _contactos.map((c) => {
      if (c.id !== id) return c;
      return { ...c, ...form } as Contacto;
    });
    return _contactos.find((c) => c.id === id)!;
  },

  addRelacion: async (entidadAId: string, entidadBId: string, cargo?: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
    const a = _contactos.find((c) => c.id === entidadAId);
    const b = _contactos.find((c) => c.id === entidadBId);
    if (!a || !b) return;

    _contactos = _contactos.map((c) => {
      if (c.id === entidadAId && !c.relaciones.some((r) => r.entidadId === entidadBId)) {
        return {
          ...c,
          relaciones: [
            ...c.relaciones,
            { entidadId: b.id, entidadNombre: b.nombre, entidadTipo: b.tipo as TipoEntidad, cargo },
          ],
        };
      }
      if (c.id === entidadBId && !c.relaciones.some((r) => r.entidadId === entidadAId)) {
        return {
          ...c,
          relaciones: [
            ...c.relaciones,
            { entidadId: a.id, entidadNombre: a.nombre, entidadTipo: a.tipo as TipoEntidad, cargo },
          ],
        };
      }
      return c;
    });
  },

  removeRelacion: async (entidadAId: string, entidadBId: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
    _contactos = _contactos.map((c) => {
      if (c.id === entidadAId || c.id === entidadBId) {
        const otherId = c.id === entidadAId ? entidadBId : entidadAId;
        return { ...c, relaciones: c.relaciones.filter((r) => r.entidadId !== otherId) };
      }
      return c;
    });
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _contactos = _contactos.filter((c) => c.id !== id);
  },
};
