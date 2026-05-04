import { MOCK_CAMPOS_PERSONALIZADOS } from 'src/_mock/_settings';

import type { CampoPersonalizado } from '../types/settings.types';

let _campos = [...MOCK_CAMPOS_PERSONALIZADOS];

export const customFieldsService = {
  getAll: async (): Promise<CampoPersonalizado[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._campos];
  },

  create: async (
    data: Omit<CampoPersonalizado, 'id' | 'creadoEn'>
  ): Promise<CampoPersonalizado> => {
    await new Promise((r) => setTimeout(r, 500));
    const newCampo: CampoPersonalizado = {
      ...data,
      id: `cf${Date.now()}`,
      creadoEn: new Date().toISOString(),
    };
    _campos = [..._campos, newCampo];
    return newCampo;
  },

  update: async (id: string, data: Partial<CampoPersonalizado>): Promise<CampoPersonalizado> => {
    await new Promise((r) => setTimeout(r, 500));
    _campos = _campos.map((c) => (c.id === id ? { ...c, ...data } : c));
    return _campos.find((c) => c.id === id)!;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _campos = _campos.filter((c) => c.id !== id);
  },
};
