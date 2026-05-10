'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentTypeService } from 'src/features/settings/services/document-type.service';
import type {
  DocumentType,
  DocumentTypePayload,
} from 'src/features/settings/types/document-type.types';

const QUERY_KEY = ['settings', 'document-types'] as const;

// Stable empty reference — prevents TanStack Table from seeing a "new" array
// on every render when the query is in error/loading state (data = undefined).
// Without this, `= []` creates a new reference each render → autoResetPageIndex
// fires → setPagination called with new object → re-render → infinite loop.
const EMPTY: DocumentType[] = [];

export function useDocumentTypes() {
  const queryClient = useQueryClient();

  const {
    data: documentTypes = EMPTY,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEY,
    staleTime: 0,
    queryFn: () => documentTypeService.list(),
  });

  const createDocumentType = useMutation({
    mutationFn: (payload: DocumentTypePayload) => documentTypeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tipo de documento creado');
    },
    onError: () => toast.error('Error al crear tipo de documento'),
  });

  const updateDocumentType = useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: Partial<DocumentTypePayload> }) =>
      documentTypeService.update(uid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tipo de documento actualizado');
    },
    onError: () => toast.error('Error al actualizar tipo de documento'),
  });

  const deleteDocumentType = useMutation({
    mutationFn: (uid: string) => documentTypeService.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tipo de documento eliminado');
    },
    onError: () => toast.error('Error al eliminar tipo de documento'),
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
