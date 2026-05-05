import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Tag, TagColor, TagForm } from '../types/tags.types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function mapTag(raw: Record<string, unknown>): Tag {
  return {
    id: raw.uid as string,
    name: raw.name as string,
    color: (raw.color as TagColor) ?? 'blue',
    entities: [],
    created_at: (raw.created_at as string) ?? '',
  };
}

export const tagsService = {
  async getAll(): Promise<Tag[]> {
    const res = await axiosInstance.get(endpoints.settings.tags, {
      params: { paginate: false },
    });
    const payload = res.data?.data ?? res.data;
    return (Array.isArray(payload) ? payload : []).map(mapTag);
  },

  async create(form: TagForm): Promise<Tag> {
    const res = await axiosInstance.post(endpoints.settings.tags, {
      name: form.name,
      key: slugify(form.name),
      color: form.color,
      category: 'general',
    });
    const payload = res.data?.data ?? res.data;
    return mapTag(payload);
  },

  async update(id: string, form: Partial<TagForm>): Promise<Tag> {
    const body: Record<string, string> = {};
    if (form.name) {
      body.name = form.name;
      body.key = slugify(form.name);
    }
    if (form.color) body.color = form.color;
    const res = await axiosInstance.put(endpoints.settings.tag(id), body);
    const payload = res.data?.data ?? res.data;
    return mapTag(payload);
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(endpoints.settings.tag(id));
  },
};
