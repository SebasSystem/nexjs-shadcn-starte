import { MOCK_LOCALIZACION } from 'src/_mock/_settings';
import type { ConfigLocalizacion } from '../types/settings.types';

let _config = { ...MOCK_LOCALIZACION };

export const localizationService = {
  get: async (): Promise<ConfigLocalizacion> => {
    await new Promise((r) => setTimeout(r, 300));
    return { ..._config };
  },

  update: async (data: Partial<ConfigLocalizacion>): Promise<ConfigLocalizacion> => {
    await new Promise((r) => setTimeout(r, 500));
    _config = { ..._config, ...data };
    return { ..._config };
  },
};
