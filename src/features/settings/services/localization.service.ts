import { MOCK_LOCALIZACION } from 'src/_mock/_settings';
import { setCurrencyPreferences } from 'src/lib/currency';

import type { ConfigLocalizacion } from '../types/settings.types';

let _config = { ...MOCK_LOCALIZACION };

export const localizationService = {
  get: async (): Promise<ConfigLocalizacion> => {
    await new Promise((r) => setTimeout(r, 300));
    setCurrencyPreferences({ currency: _config.moneda, locale: _config.idioma }, 'tenant');
    return { ..._config };
  },

  update: async (data: Partial<ConfigLocalizacion>): Promise<ConfigLocalizacion> => {
    await new Promise((r) => setTimeout(r, 500));
    _config = { ..._config, ...data };
    setCurrencyPreferences({ currency: _config.moneda, locale: _config.idioma }, 'tenant');
    return { ..._config };
  },
};
