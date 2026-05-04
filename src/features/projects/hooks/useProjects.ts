import { useMemo, useState } from 'react';
import { MOCK_PROJECTS } from 'src/_mock/_projects';

import type { Milestone, Project, ProjectResource, ProjectStatus } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.status === 'completed').length;
  return Math.round((done / milestones.length) * 100);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

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

  function getProjectById(id: string): Project | undefined {
    return projects.find((p) => p.id === id);
  }

  function createProject(
    data: Omit<Project, 'id' | 'milestones' | 'resources' | 'progress' | 'createdAt'>
  ) {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      milestones: [],
      resources: [],
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
  }

  function updateProject(id: string, changes: Partial<Project>) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function cancelProject(id: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'cancelled' as ProjectStatus } : p))
    );
  }

  function addMilestone(projectId: string, milestone: Omit<Milestone, 'id'>) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestones = [...p.milestones, { ...milestone, id: `ms-${Date.now()}` }];
        return { ...p, milestones: newMilestones, progress: calcProgress(newMilestones) };
      })
    );
  }

  function updateMilestone(projectId: string, milestoneId: string, changes: Partial<Milestone>) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, ...changes } : m
        );
        return { ...p, milestones: newMilestones, progress: calcProgress(newMilestones) };
      })
    );
  }

  function deleteMilestone(projectId: string, milestoneId: string) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestones = p.milestones.filter((m) => m.id !== milestoneId);
        return { ...p, milestones: newMilestones, progress: calcProgress(newMilestones) };
      })
    );
  }

  function addResource(projectId: string, resource: Omit<ProjectResource, 'id'>) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          resources: [...p.resources, { ...resource, id: `res-${Date.now()}` }],
        };
      })
    );
  }

  function removeResource(projectId: string, resourceId: string) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return { ...p, resources: p.resources.filter((r) => r.id !== resourceId) };
      })
    );
  }

  return {
    projects,
    stats,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    cancelProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addResource,
    removeResource,
  };
}
