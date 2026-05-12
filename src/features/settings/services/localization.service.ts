import axiosInstance, { endpoints } from 'src/lib/axios';

// ─── Thin service — only raw API calls, no side-effects ────────────────────

export const localizationService = {
  async get() {
    const res = await axiosInstance.get(endpoints.settings.localization.get);
    return res.data;
  },

  async getOptions(): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.settings.localization.options);
    return res.data;
  },

  async update(data: Record<string, unknown>) {
    const res = await axiosInstance.put(endpoints.settings.localization.update, data);
    return res.data;
  },

  async getCountries(): Promise<Array<{ name: string }>> {
    const res = await axiosInstance.get('/api/settings/countries');
    return (res.data?.data ?? []) as Array<{ name: string }>;
  },

  async getCities(params: { country?: string; search?: string }): Promise<Array<{ name: string }>> {
    const searchParams = new URLSearchParams();
    if (params.country) searchParams.set('country', params.country);
    if (params.search) searchParams.set('search', params.search);
    const res = await axiosInstance.get(`/api/settings/cities?${searchParams.toString()}`);
    return (res.data?.data ?? []) as Array<{ name: string }>;
  },
};
