'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { contactsService } from '../services/contacts.service';
import type { ContactPayload } from '../types/contacts.types';

export function useContacts() {
  const queryClient = useQueryClient();

  const { data: contactos = [], isLoading } = useQuery({
    queryKey: queryKeys.contacts.list,
    queryFn: () => contactsService.getAll(),
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
  };
}
