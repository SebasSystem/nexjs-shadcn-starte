import axiosInstance, { endpoints } from 'src/lib/axios';

// ─── Status option shape (backend StaticOptionController contract) ─────────
export interface StatusOption {
  value: string;
  label: string;
}

// ─── Thin service — raw API calls for all status/option endpoints ─────────

export const statusService = {
  /** GET /users/statuses → ACTIVO, INACTIVO */
  async userStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.users.statuses);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /tasks/statuses → pending, in_progress, completed, cancelled */
  async taskStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.tasks.statuses);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /tasks/priorities → low, medium, high, urgent */
  async taskPriorities(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.tasks.priorities);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /projects/statuses → pending, planning, active, in_progress, on_hold, paused, completed, cancelled */
  async projectStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.projects.statuses);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /milestones/statuses → pending, in_progress, done, completed */
  async milestoneStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.projects.milestones.statuses);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /quotations/statuses → draft, sent, approved, rejected, cancelled */
  async quotationStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.sales.quotationStatuses);
    return (res.data?.data ?? []) as StatusOption[];
  },

  /** GET /invoices/statuses → draft, issued, partial, paid, overdue */
  async invoiceStatuses(): Promise<StatusOption[]> {
    const res = await axiosInstance.get(endpoints.sales.invoiceStatuses);
    return (res.data?.data ?? []) as StatusOption[];
  },
};
