import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

import type { Tag, TagForm } from '../types/tags.types';

export const tagsService = {
  async getAll(params?: PaginationParams): Promise<Tag[]> {
    const res = await axiosInstance.get(endpoints.settings.tags, { params });
    return res.data; // full response — callers extract .data for the array
  },

  async create(form: TagForm): Promise<Tag> {
    const res = await axiosInstance.post(endpoints.settings.tags, {
      name: form.name,
      color: form.color,
      entity_types: form.entity_types,
    });
    return (res.data?.data ?? res.data) as Tag;
  },

  async update(id: string, form: Partial<TagForm>): Promise<Tag> {
    const body: Record<string, unknown> = {};
    if (form.name) body.name = form.name;
    if (form.color) body.color = form.color;
    if (form.entity_types) body.entity_types = form.entity_types;
    const res = await axiosInstance.put(endpoints.settings.tag(id), body);
    return (res.data?.data ?? res.data) as Tag;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(endpoints.settings.tag(id));
  },
};
