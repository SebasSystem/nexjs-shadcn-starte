import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Opportunity } from '../types/sales.types';

export const opportunityService = {
  async getStages() {
    const res = await axiosInstance.get(endpoints.sales.stages);
    return res.data.data;
  },

  async getBoard() {
    const res = await axiosInstance.get(endpoints.sales.board);
    return res.data.data;
  },

  async getList(): Promise<Opportunity[]> {
    const res = await axiosInstance.get(endpoints.sales.opportunities);
    return res.data.data;
  },

  async getOne(uid: string): Promise<Opportunity> {
    const res = await axiosInstance.get(endpoints.sales.opportunity(uid));
    return res.data.data;
  },

  async create(data: Partial<Opportunity>): Promise<Opportunity> {
    const res = await axiosInstance.post(endpoints.sales.opportunities, data);
    return res.data.data;
  },

  async update(uid: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const res = await axiosInstance.put(endpoints.sales.opportunity(uid), data);
    return res.data.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.sales.opportunity(uid));
  },
};
