'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { projectsService } from '../services/projects.service';
import type { MilestonePayload, ProjectPayload, ProjectResourcePayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: queryKeys.projects.list,
    queryFn: () => projectsService.list(),
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

  const createProject = async (payload: ProjectPayload): Promise<boolean> => {
    try {
      await projectsService.create(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      return true;
    } catch {
      return false;
    }
  };

  const updateProject = async (uid: string, payload: Partial<ProjectPayload>): Promise<boolean> => {
    try {
      await projectsService.update(uid, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      return true;
    } catch {
      return false;
    }
  };

  const deleteProject = async (uid: string): Promise<void> => {
    await projectsService.remove(uid);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
  };

  // ─── Milestones ────────────────────────────────────────────────────────

  const addMilestone = async (projectUid: string, payload: MilestonePayload): Promise<boolean> => {
    try {
      await projectsService.addMilestone(projectUid, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      return true;
    } catch {
      return false;
    }
  };

  const updateMilestone = async (
    projectUid: string,
    milestoneUid: string,
    payload: Partial<MilestonePayload>
  ): Promise<boolean> => {
    try {
      await projectsService.updateMilestone(projectUid, milestoneUid, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      return true;
    } catch {
      return false;
    }
  };

  const deleteMilestone = async (projectUid: string, milestoneUid: string): Promise<void> => {
    await projectsService.removeMilestone(projectUid, milestoneUid);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
  };

  // ─── Resources ─────────────────────────────────────────────────────────

  const addResource = async (
    projectUid: string,
    payload: ProjectResourcePayload
  ): Promise<boolean> => {
    try {
      await projectsService.addResource(projectUid, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
      return true;
    } catch {
      return false;
    }
  };

  const removeResource = async (projectUid: string, resourceUid: string): Promise<void> => {
    await projectsService.removeResource(projectUid, resourceUid);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.list });
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
  };
}
