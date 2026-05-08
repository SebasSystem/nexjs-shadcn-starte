'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { contactsService } from '../services/contacts.service';
import type { ContactPayload } from '../types/contacts.types';

export function useContacts() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  const { data: contactos = [], isLoading } = useQuery({
    queryKey: [...queryKeys.contacts.list, pagination.params],
    queryFn: async () => {
      const res = await contactsService.getAll(pagination.params);
      // Extract meta attached to the merged array by contactsService
      const metaObj = (res as unknown as { meta?: Record<string, unknown> }).meta;
      if (metaObj) {
        const meta = extractPaginationMeta(metaObj);
        if (meta) pagination.setTotal(meta.total);
      }
      return res;
    },
  });

  const createContacto = async (form: ContactPayload): Promise<boolean> => {
    try {
      await contactsService.create(form);
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
      return true;
    } catch {
      return false;
    }
  };

  const updateContacto = async (uid: string, form: Partial<ContactPayload>): Promise<boolean> => {
    try {
      await contactsService.update(uid, form);
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
      return true;
    } catch {
      return false;
    }
  };

  const addRelacion = async (aId: string, bId: string, role?: string): Promise<void> => {
    await contactsService.addRelacion(aId, bId, role);
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
  };

  const removeRelacion = async (aId: string, bId: string): Promise<void> => {
    await contactsService.removeRelacion(aId, bId);
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
  };

  const deleteContacto = async (uid: string): Promise<void> => {
    await contactsService.delete(uid);
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
  };

  const checkDuplicate = (email: string, taxId?: string, excludeId?: string) =>
    contactsService.checkDuplicate(email, taxId, excludeId);

  return {
    contactos,
    isLoading,
    createContacto,
    updateContacto,
    addRelacion,
    removeRelacion,
    deleteContacto,
    checkDuplicate,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list }),
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
