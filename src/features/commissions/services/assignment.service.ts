import axiosInstance, { endpoints } from 'src/lib/axios';

import type { CommissionAssignment } from '../types/commissions.types';

function mapAssignment(raw: Record<string, unknown>): CommissionAssignment {
  return {
    uid: raw.uid as string,
    user_uid: raw.user_uid as string,
    user_name: raw.user_name as string,
    user_avatar: raw.user_avatar as string | undefined,
    team_uid: raw.team_uid as string,
    team_name: raw.team_name as string,
    plan_uid: raw.plan_uid as string | undefined,
    plan_name: raw.plan_name as string | undefined,
    plan_type: raw.plan_type as CommissionAssignment['plan_type'],
    start_date: raw.start_date as string | undefined,
    end_date: raw.end_date as string | undefined,
    status: raw.status as CommissionAssignment['status'],
  };
}

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
  async getAssignments(): Promise<CommissionAssignment[]> {
    const res = await axiosInstance.get(endpoints.commissions.assignments.list);
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapAssignment);
  },

  async createAssignment(data: CreateAssignmentPayload): Promise<CommissionAssignment> {
    const res = await axiosInstance.post(endpoints.commissions.assignments.create, data);
    return mapAssignment(res.data?.data ?? res.data);
  },

  async updateAssignment(
    uid: string,
    data: UpdateAssignmentPayload
  ): Promise<CommissionAssignment> {
    const res = await axiosInstance.put(endpoints.commissions.assignments.update(uid), data);
    return mapAssignment(res.data?.data ?? res.data);
  },
};
