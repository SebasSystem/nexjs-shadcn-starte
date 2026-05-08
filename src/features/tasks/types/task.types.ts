export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  uid: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  owner: { uid: string; name: string } | null;
  assigned_user: { uid: string; name: string } | null;
  taskable: { uid: string; name: string; type: string } | null;
  created_at: string;
  updated_at: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  assigned_user_uid?: string;
  taskable_type?: string;
  taskable_uid?: string;
}
