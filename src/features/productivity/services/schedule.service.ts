import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

// ─── Schedule item (backend ScheduleService contract) ──────────────────────
export type ScheduleSource = 'agenda' | 'project' | 'pipeline';

export interface ScheduleItem {
  uid: string;
  source: ScheduleSource;
  type: string;
  title: string;
  description: string | null;
  status: string;
  date: string | null;
  scheduled_at: string | null;
  due_date: string | null;
  /** Solo agenda */
  entity_uid?: string;
  /** Solo project */
  project_uid?: string;
  project_name?: string;
  /** Ambos */
  assigned_to_uid?: string;
  assigned_to_name?: string;
}

export interface ScheduleParams extends PaginationParams {
  status?: string;
  source?: string;
  search?: string;
}

// ─── Service ───────────────────────────────────────────────────────────────

export const scheduleService = {
  async list(params?: ScheduleParams): Promise<ScheduleItem[]> {
    const res = await axiosInstance.get(endpoints.productivity.schedule, { params });
    return (res.data?.data ?? res.data ?? []) as ScheduleItem[];
  },
};
