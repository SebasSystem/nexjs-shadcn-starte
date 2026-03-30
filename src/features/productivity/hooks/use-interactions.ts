import { useState, useCallback, useEffect } from 'react';
import type { Interaccion, TipoInteraccion } from '../types/productivity.types';
import { ProductivityService } from '../services/productivity.service';
import { toast } from 'sonner';

export const useInteractions = (contactoId: string) => {
  const [data, setData] = useState<Interaccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await ProductivityService.getInteracciones(contactoId);
      setData(items);
    } catch {
      toast.error('Error al cargar interacciones');
    } finally {
      setIsLoading(false);
    }
  }, [contactoId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addInteraccion = async (tipo: TipoInteraccion, contenido: string) => {
    try {
      setIsSubmitting(true);
      await ProductivityService.createInteraccion({
        contactoId,
        tipo,
        contenido,
      });
      await fetchItems();
      toast.success('Interacción registrada exitosamente');
      return true;
    } catch {
      toast.error('Error al registrar interacción');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { data, isLoading, isSubmitting, addInteraccion, refresh: fetchItems };
};
