'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { projectsService } from '../services/projects.service';
import type { MilestonePayload, Project, ProjectPayload, ProjectResourcePayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseProjectsParams {
  /** Server-side status filter (backend-supported).
   *  Maps to ProjectService::getProjects() → ProjectRepository::all() status filter. */
  status?: string;
}

export function useProjects(params?: UseProjectsParams) {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  // Merge external status filter with pagination params (search is already in pagination.params)
  const queryParams = {
    ...pagination.params,
    ...(params?.status ? { status: params.status } : {}),
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: [...queryKeys.projects.list, queryParams],
    queryFn: async () => {
      const res = await projectsService.list(queryParams);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return ((res as unknown as { data?: Project[] }).data ?? []) as Project[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  // ─── Stats (derived) ────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const active = projects.filter(
      (p) => p.status === 'in_progress' || p.status === 'planning'
    ).length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const onHold = projects.filter((p) => p.status === 'on_hold').length;
    const delayedMilestones = projects.reduce(
      (acc, p) => acc + p.milestones.filter((m) => m.status === 'delayed').length,
      0
    );
    return { active, completed, onHold, delayedMilestones };
  }, [projects]);

  // ─── CRUD: Projects ────────────────────────────────────────────────────

  const createProjectMutation = useMutation({
    mutationFn: (payload: ProjectPayload) => projectsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Proyecto creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<ProjectPayload> }) =>
      projectsService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Proyecto actualizado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (uid: string) => projectsService.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Proyecto eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const createProject = async (payload: ProjectPayload): Promise<boolean> => {
    await createProjectMutation.mutateAsync(payload);
    return true;
  };

  const updateProject = async (uid: string, payload: Partial<ProjectPayload>): Promise<boolean> => {
    await updateProjectMutation.mutateAsync({ uid, payload });
    return true;
  };

  const deleteProject = async (uid: string): Promise<void> => {
    await deleteProjectMutation.mutateAsync(uid);
  };

  // ─── Milestones ────────────────────────────────────────────────────────

  const addMilestoneMutation = useMutation({
    mutationFn: ({ projectUid, payload }: { projectUid: string; payload: MilestonePayload }) =>
      projectsService.addMilestone(projectUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Hito agregado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({
      projectUid,
      milestoneUid,
      payload,
    }: {
      projectUid: string;
      milestoneUid: string;
      payload: Partial<MilestonePayload>;
    }) => projectsService.updateMilestone(projectUid, milestoneUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Hito actualizado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: ({ projectUid, milestoneUid }: { projectUid: string; milestoneUid: string }) =>
      projectsService.removeMilestone(projectUid, milestoneUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Hito eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const addMilestone = async (projectUid: string, payload: MilestonePayload): Promise<boolean> => {
    await addMilestoneMutation.mutateAsync({ projectUid, payload });
    return true;
  };

  const updateMilestone = async (
    projectUid: string,
    milestoneUid: string,
    payload: Partial<MilestonePayload>
  ): Promise<boolean> => {
    await updateMilestoneMutation.mutateAsync({ projectUid, milestoneUid, payload });
    return true;
  };

  const deleteMilestone = async (projectUid: string, milestoneUid: string): Promise<void> => {
    await deleteMilestoneMutation.mutateAsync({ projectUid, milestoneUid });
  };

  // ─── Resources ─────────────────────────────────────────────────────────

  const addResourceMutation = useMutation({
    mutationFn: ({
      projectUid,
      payload,
    }: {
      projectUid: string;
      payload: ProjectResourcePayload;
    }) => projectsService.addResource(projectUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Recurso agregado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const removeResourceMutation = useMutation({
    mutationFn: ({ projectUid, resourceUid }: { projectUid: string; resourceUid: string }) =>
      projectsService.removeResource(projectUid, resourceUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      toast.success('Recurso eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const addResource = async (
    projectUid: string,
    payload: ProjectResourcePayload
  ): Promise<boolean> => {
    await addResourceMutation.mutateAsync({ projectUid, payload });
    return true;
  };

  const removeResource = async (projectUid: string, resourceUid: string): Promise<void> => {
    await removeResourceMutation.mutateAsync({ projectUid, resourceUid });
  };

  return {
    projects,
    isLoading,
    stats,
    createProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addResource,
    removeResource,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.list }),
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
    /** Search term wired to server-side (backend-supported). */
    search: pagination.search ?? '',
    onChangeSearch: pagination.onChangeSearch,
    status: params?.status ?? 'all',
  };
}
