'use client';

import { useQuery } from '@tanstack/react-query';
import { statusService, type StatusOption } from '../services/status.service';

// ─── Query keys for status cache ───────────────────────────────────────────
export const statusQueryKeys = {
  users: ['statuses', 'users'] as const,
  tasks: ['statuses', 'tasks'] as const,
  taskPriorities: ['statuses', 'tasks', 'priorities'] as const,
  projects: ['statuses', 'projects'] as const,
  milestones: ['statuses', 'milestones'] as const,
  quotations: ['statuses', 'quotations'] as const,
  invoices: ['statuses', 'invoices'] as const,
};

// ─── Per-entity hooks (tree-shakeable — import only what you need) ─────────

/** User statuses: ACTIVO, INACTIVO */
export function useUserStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.users,
    queryFn: () => statusService.userStatuses(),
    staleTime: 5 * 60 * 1000, // 5 min — static values
  });
}

/** Task statuses: pending, in_progress, completed, cancelled */
export function useTaskStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.tasks,
    queryFn: () => statusService.taskStatuses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Task priorities: low, medium, high, urgent */
export function useTaskPriorityOptions() {
  return useQuery({
    queryKey: statusQueryKeys.taskPriorities,
    queryFn: () => statusService.taskPriorities(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Project statuses: pending, planning, active, in_progress, on_hold, paused, completed, cancelled */
export function useProjectStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.projects,
    queryFn: () => statusService.projectStatuses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Milestone statuses: pending, in_progress, done, completed */
export function useMilestoneStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.milestones,
    queryFn: () => statusService.milestoneStatuses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Quotation statuses: draft, sent, approved, rejected, cancelled */
export function useQuotationStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.quotations,
    queryFn: () => statusService.quotationStatuses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Invoice statuses: draft, issued, partial, paid, overdue */
export function useInvoiceStatusOptions() {
  return useQuery({
    queryKey: statusQueryKeys.invoices,
    queryFn: () => statusService.invoiceStatuses(),
    staleTime: 5 * 60 * 1000,
  });
}
