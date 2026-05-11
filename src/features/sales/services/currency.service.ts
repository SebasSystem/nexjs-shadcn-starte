import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

export type CurrencyConvertPayload = {
  from: string;
  to: string;
  amount: number;
};

export const currencyService = {
  async getRates(params?: PaginationParams): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.sales.currencyRates, { params });
    return res.data;
  },

  async upsertRate(data: {
    from_currency: string;
    to_currency: string;
    rate: number;
  }): Promise<unknown> {
    const res = await axiosInstance.post(endpoints.sales.currencyRates, data);
    return res.data;
  },

  async convert(data: CurrencyConvertPayload) {
    const res = await axiosInstance.post(endpoints.sales.currencyConvert, data);
    return res.data.data;
  },
};
