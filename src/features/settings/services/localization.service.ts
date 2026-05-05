import axiosInstance, { endpoints } from 'src/lib/axios';
import { setCurrencyPreferences } from 'src/lib/currency';

import type { LocalizationConfig } from '../types/settings.types';

export const localizationService = {
  async get(): Promise<LocalizationConfig> {
    const res = await axiosInstance.get(endpoints.settings.localization.get);
    const payload = res.data?.data ?? res.data;
    if (payload) {
      setCurrencyPreferences({ currency: payload.currency, locale: payload.locale }, 'tenant');
    }
    return payload;
  },

  async update(data: Partial<LocalizationConfig>): Promise<LocalizationConfig> {
    const res = await axiosInstance.put(endpoints.settings.localization.update, data);
    const payload = res.data?.data ?? res.data;
    if (payload) {
      setCurrencyPreferences({ currency: payload.currency, locale: payload.locale }, 'tenant');
    }
    return payload;
  },
};
