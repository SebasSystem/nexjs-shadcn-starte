import { useState } from 'react';

import type { Tag, TagForm } from '../types/tags.types';

const MOCK_TAGS: Tag[] = [
  {
    id: '1',
    nombre: 'VIP',
    color: 'yellow',
    entidades: ['CONTACT', 'COMPANY'],
    creadoEn: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: '2',
    nombre: 'Lista Negra',
    color: 'red',
    entidades: ['CONTACT'],
    creadoEn: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: '3',
    nombre: 'Cliente Recurrente',
    color: 'green',
    entidades: ['CONTACT', 'COMPANY'],
    creadoEn: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: '4',
    nombre: 'Alta Prioridad',
    color: 'purple',
    entidades: ['DEAL', 'LEAD'],
    creadoEn: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [isLoading, setIsLoading] = useState(false);

  const createTag = async (form: TagForm): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulando red
    const newTag: Tag = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      creadoEn: new Date().toISOString(),
    };
    setTags((prev) => [newTag, ...prev]);
    setIsLoading(false);
    return true;
  };

  const updateTag = async (id: string, form: Partial<TagForm>): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulando red
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...form } : t)));
    setIsLoading(false);
    return true;
  };

  const deleteTag = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulando red
    setTags((prev) => prev.filter((t) => t.id !== id));
    setIsLoading(false);
    return true;
  };

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
  };
};
