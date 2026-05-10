'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { tagsService } from '../services/tags.service';
import type { Tag, TagForm } from '../types/tags.types';

export const useTags = () => {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: [...queryKeys.settings.tags, pagination.params],
    staleTime: 0,
    queryFn: async () => {
      const res = await tagsService.getAll(pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return (res as unknown as { data?: Tag[] }).data ?? ([] as Tag[]);
    },
  });

  const createMutation = useMutation({
    mutationFn: (form: TagForm) => tagsService.create(form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.tags }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: Partial<TagForm> }) =>
      tagsService.update(id, form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.tags }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.tags }),
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    tags,
    isLoading,
    createTag: async (form: TagForm) => {
      await createMutation.mutateAsync(form);
      return true;
    },
    updateTag: async (id: string, form: Partial<TagForm>) => {
      await updateMutation.mutateAsync({ id, form });
      return true;
    },
    deleteTag: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
};
