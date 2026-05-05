import axiosInstance, { endpoints } from 'src/lib/axios';

export type CurrencyConvertPayload = {
  from: string;
  to: string;
  amount: number;
};

export const currencyService = {
  async getRates() {
    const res = await axiosInstance.get(endpoints.sales.currencyRates);
    return res.data.data;
  },

  async convert(data: CurrencyConvertPayload) {
    const res = await axiosInstance.post(endpoints.sales.currencyConvert, data);
    return res.data.data;
  },
};
