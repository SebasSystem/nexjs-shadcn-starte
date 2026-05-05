'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { productivityService } from '../services/productivity.service';

export function useVault(entityType: string, entityUid: string) {
  const queryClient = useQueryClient();

  const queryKey = queryKeys.productivity.documents.byContact(entityUid);

  const { data: documents = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => productivityService.listDocuments(entityType, entityUid),
    enabled: !!entityUid,
  });

  const uploadFile = async (file: File): Promise<boolean> => {
    try {
      await productivityService.uploadDocument(entityType, entityUid, file);
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch {
      return false;
    }
  };

  const deleteFile = async (docUid: string): Promise<boolean> => {
    try {
      await productivityService.deleteDocument(entityType, entityUid, docUid);
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch {
      return false;
    }
  };

  return {
    data: documents,
    isLoading,
    uploadFile,
    deleteFile,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
