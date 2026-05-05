import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  Milestone,
  MilestonePayload,
  Project,
  ProjectPayload,
  ProjectResource,
  ProjectResourcePayload,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

function mapProject(raw: Record<string, unknown>): Project {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    client_uid: raw.client_uid as string,
    client_name: (raw.client_name as string) ?? '',
    opportunity_uid: raw.opportunity_uid as string | undefined,
    status: (raw.status as Project['status']) ?? 'planning',
    start_date: raw.start_date as string,
    end_date: raw.end_date as string,
    manager: (raw.manager as string) ?? '',
    description: (raw.description as string) ?? '',
    milestones: ((raw.milestones as Record<string, unknown>[]) ?? []).map(mapMilestone),
    resources: ((raw.resources as Record<string, unknown>[]) ?? []).map(mapResource),
    progress: (raw.progress as number) ?? 0,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string | undefined,
  };
}

function mapMilestone(raw: Record<string, unknown>): Milestone {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    description: raw.description as string | undefined,
    due_date: raw.due_date as string,
    completed_date: raw.completed_date as string | undefined,
    status: (raw.status as Milestone['status']) ?? 'pending',
    assigned_to_uid: raw.assigned_to_uid as string,
    assigned_to_name: raw.assigned_to_name as string | undefined,
  };
}

function mapResource(raw: Record<string, unknown>): ProjectResource {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    role: (raw.role as ProjectResource['role']) ?? 'consultant',
    email: (raw.email as string) ?? '',
    start_date: raw.start_date as string,
    end_date: raw.end_date as string | undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const projectsService = {
  /** Fetches all projects */
  list: async (): Promise<Project[]> => {
    const res = await axiosInstance.get(endpoints.projects.list);
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapProject);
  },

  /** Fetches a single project by UID */
  getById: async (uid: string): Promise<Project | undefined> => {
    try {
      const res = await axiosInstance.get(endpoints.projects.detail(uid));
      const data = res.data?.data ?? res.data;
      return mapProject(data);
    } catch {
      return undefined;
    }
  },

  /** Creates a new project */
  create: async (payload: ProjectPayload): Promise<Project> => {
    const res = await axiosInstance.post(endpoints.projects.create, payload);
    const data = res.data?.data ?? res.data;
    return mapProject(data);
  },

  /** Updates an existing project */
  update: async (uid: string, payload: Partial<ProjectPayload>): Promise<Project> => {
    const res = await axiosInstance.put(endpoints.projects.update(uid), payload);
    const data = res.data?.data ?? res.data;
    return mapProject(data);
  },

  /** Deletes a project */
  remove: async (uid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.projects.delete(uid));
  },

  // ─── Milestones ──────────────────────────────────────────────────────────

  /** Adds a milestone to a project */
  addMilestone: async (projectUid: string, payload: MilestonePayload): Promise<Milestone> => {
    const res = await axiosInstance.post(endpoints.projects.milestones.create(projectUid), payload);
    const data = res.data?.data ?? res.data;
    return mapMilestone(data);
  },

  /** Updates a milestone */
  updateMilestone: async (
    projectUid: string,
    milestoneUid: string,
    payload: Partial<MilestonePayload>
  ): Promise<Milestone> => {
    const res = await axiosInstance.put(
      endpoints.projects.milestones.update(projectUid, milestoneUid),
      payload
    );
    const data = res.data?.data ?? res.data;
    return mapMilestone(data);
  },

  /** Removes a milestone */
  removeMilestone: async (projectUid: string, milestoneUid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.projects.milestones.delete(projectUid, milestoneUid));
  },

  // ─── Resources ───────────────────────────────────────────────────────────

  /** Assigns a resource to a project */
  addResource: async (
    projectUid: string,
    payload: ProjectResourcePayload
  ): Promise<ProjectResource> => {
    const res = await axiosInstance.post(endpoints.projects.resources.create(projectUid), payload);
    const data = res.data?.data ?? res.data;
    return mapResource(data);
  },

  /** Removes a resource from a project */
  removeResource: async (projectUid: string, resourceUid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.projects.resources.delete(projectUid, resourceUid));
  },
};
