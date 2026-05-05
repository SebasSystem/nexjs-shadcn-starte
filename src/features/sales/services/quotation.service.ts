import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Quotation, QuotationItem } from '../types/sales.types';

export const quotationService = {
  async getList(): Promise<Quotation[]> {
    const res = await axiosInstance.get(endpoints.sales.quotations);
    return res.data.data;
  },

  async getOne(uid: string): Promise<Quotation> {
    const res = await axiosInstance.get(endpoints.sales.quotation(uid));
    return res.data.data;
  },

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const res = await axiosInstance.post(endpoints.sales.quotations, data);
    return res.data.data;
  },

  async update(uid: string, data: Partial<Quotation>): Promise<Quotation> {
    const res = await axiosInstance.put(endpoints.sales.quotation(uid), data);
    return res.data.data;
  },

  async getPdf(uid: string): Promise<Blob> {
    const res = await axiosInstance.get(endpoints.sales.quotationPdf(uid), {
      responseType: 'blob',
    });
    return res.data;
  },

  async addItem(uid: string, data: Partial<QuotationItem>): Promise<QuotationItem> {
    const res = await axiosInstance.post(endpoints.sales.quotationItems(uid), data);
    return res.data.data;
  },

  async updateItem(itemUid: string, data: Partial<QuotationItem>): Promise<QuotationItem> {
    const res = await axiosInstance.put(endpoints.sales.quotationItem(itemUid), data);
    return res.data.data;
  },

  async deleteItem(itemUid: string): Promise<void> {
    await axiosInstance.delete(endpoints.sales.quotationItem(itemUid));
  },
};
