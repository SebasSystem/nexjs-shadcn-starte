import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { Task, TaskPayload } from '../types/task.types';

export const taskService = {
  async list(params?: PaginationParams & { status?: string; priority?: string }): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.tasks.list, { params });
    return res.data;
  },

  async get(uid: string): Promise<Task> {
    const res = await axiosInstance.get(endpoints.tasks.detail(uid));
    return res.data.data;
  },

  async create(payload: TaskPayload): Promise<Task> {
    const res = await axiosInstance.post(endpoints.tasks.create, payload);
    return res.data.data;
  },

  async update(uid: string, payload: Partial<TaskPayload>): Promise<Task> {
    const res = await axiosInstance.put(endpoints.tasks.update(uid), payload);
    return res.data.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.tasks.delete(uid));
  },
};
