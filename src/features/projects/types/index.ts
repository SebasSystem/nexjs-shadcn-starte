export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';
export type ResourceRole = 'consultant' | 'technician' | 'manager' | 'support';

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  assignedTo: string;
}

export interface ProjectResource {
  id: string;
  name: string;
  role: ResourceRole;
  email: string;
  startDate: string;
  endDate?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  opportunityId?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  manager: string;
  description: string;
  milestones: Milestone[];
  resources: ProjectResource[];
  progress: number;
  createdAt: string;
}
