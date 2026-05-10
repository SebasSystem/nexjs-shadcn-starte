'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentTypeService } from 'src/features/settings/services/document-type.service';
import type {
  DocumentType,
  DocumentTypePayload,
} from 'src/features/settings/types/document-type.types';
import { extractApiError } from 'src/lib/api-errors';

const BASE_KEY = ['settings', 'document-types'] as const;

const EMPTY: DocumentType[] = [];

export function useDocumentTypes(filters?: { search?: string }) {
  const queryClient = useQueryClient();

  const queryKey = [...BASE_KEY, filters?.search ?? ''] as const;

  const {
    data: documentTypes = EMPTY,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    staleTime: 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      documentTypeService.list(filters?.search ? { search: filters.search } : undefined),
  });

  const createDocumentType = useMutation({
    mutationFn: (payload: DocumentTypePayload) => documentTypeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_KEY });
      toast.success('Tipo de documento creado');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateDocumentType = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<DocumentTypePayload> }) =>
      documentTypeService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_KEY });
      toast.success('Tipo de documento actualizado');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const deleteDocumentType = useMutation({
    mutationFn: (uid: string) => documentTypeService.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_KEY });
      toast.success('Tipo de documento eliminado');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  return {
    documentTypes,
    isLoading,
    isError,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
  };
}
