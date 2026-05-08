'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskService } from 'src/features/tasks/services/task.service';
import type { Task, TaskPayload } from 'src/features/tasks/types/task.types';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const QUERY_KEY = ['tasks'] as const;

export function useTasks() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEY, pagination.params],
    queryFn: async () => {
      const res = await taskService.list(pagination.params);
      const meta = extractPaginationMeta(res);
      if (meta) pagination.setTotal(meta.total);
      return ((res as unknown as { data?: Task[] }).data ?? []) as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: (payload: TaskPayload) => taskService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea creada');
    },
    onError: () => toast.error('Error al crear tarea'),
  });

  const updateTask = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<TaskPayload> }) =>
      taskService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea actualizada');
    },
    onError: () => toast.error('Error al actualizar tarea'),
  });

  const deleteTask = useMutation({
    mutationFn: (uid: string) => taskService.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea eliminada');
    },
    onError: () => toast.error('Error al eliminar tarea'),
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
