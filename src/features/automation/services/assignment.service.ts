import axiosInstance, { endpoints } from 'src/lib/axios';

import type { AssignmentRule } from '../types';

export const assignmentService = {
  async getAll(): Promise<AssignmentRule[]> {
    const res = await axiosInstance.get(endpoints.automation.assignmentRules.list);
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async create(
    data: Omit<AssignmentRule, 'uid' | 'created_at' | 'round_robin_index'>
  ): Promise<AssignmentRule> {
    const res = await axiosInstance.post(endpoints.automation.assignmentRules.create, data);
    return res.data?.data ?? res.data;
  },

  async update(uid: string, data: Partial<AssignmentRule>): Promise<AssignmentRule> {
    const res = await axiosInstance.put(endpoints.automation.assignmentRules.update(uid), data);
    return res.data?.data ?? res.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.automation.assignmentRules.delete(uid));
  },
};
