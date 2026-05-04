'use client';

import { useCallback, useEffect, useState } from 'react';

import { contactsService } from '../services/contacts.service';
import type { Contacto, ContactoForm } from '../types/contacts.types';

export function useContacts() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContactos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await contactsService.getAll();
      setContactos(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  const createContacto = async (form: ContactoForm): Promise<boolean> => {
    try {
      const newContacto = await contactsService.create(form);
      setContactos((prev) => [...prev, newContacto]);
      return true;
    } catch {
      return false;
    }
  };

  const updateContacto = async (id: string, form: Partial<ContactoForm>): Promise<boolean> => {
    try {
      const updated = await contactsService.update(id, form);
      setContactos((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return true;
    } catch {
      return false;
    }
  };

  const addRelacion = async (aId: string, bId: string, cargo?: string): Promise<void> => {
    await contactsService.addRelacion(aId, bId, cargo);
    const updated = await contactsService.getAll();
    setContactos(updated);
  };

  const removeRelacion = async (aId: string, bId: string): Promise<void> => {
    await contactsService.removeRelacion(aId, bId);
    const updated = await contactsService.getAll();
    setContactos(updated);
  };

  const deleteContacto = async (id: string): Promise<void> => {
    await contactsService.delete(id);
    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  const checkDuplicate = (email: string, nit?: string, excludeId?: string) =>
    contactsService.checkDuplicate(email, nit, excludeId);

  return {
    contactos,
    isLoading,
    createContacto,
    updateContacto,
    addRelacion,
    removeRelacion,
    deleteContacto,
    checkDuplicate,
    refetch: fetchContactos,
  };
}
