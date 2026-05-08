import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { CommissionAssignment } from '../types/commissions.types';

export interface CreateAssignmentPayload {
  user_uid: string;
  plan_uid: string;
  start_date: string;
  end_date?: string;
}

export interface UpdateAssignmentPayload {
  plan_uid?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export const assignmentService = {
  async getAssignments(params?: PaginationParams): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.commissions.assignments.list, { params });
    return res.data;
  },

  async createAssignment(data: CreateAssignmentPayload): Promise<CommissionAssignment> {
    const res = await axiosInstance.post(endpoints.commissions.assignments.create, data);
    return (res.data?.data ?? res.data) as CommissionAssignment;
  },

  async updateAssignment(
    uid: string,
    data: UpdateAssignmentPayload
  ): Promise<CommissionAssignment> {
    const res = await axiosInstance.put(endpoints.commissions.assignments.update(uid), data);
    return (res.data?.data ?? res.data) as CommissionAssignment;
  },
};
