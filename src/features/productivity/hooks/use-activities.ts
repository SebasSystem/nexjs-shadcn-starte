import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ProductivityService } from '../services/productivity.service';
import type { Actividad, EstadoActividad } from '../types/productivity.types';

export const useActivities = (contactoId?: string) => {
  const [data, setData] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await ProductivityService.getActividades(contactoId);
      setData(items);
    } catch {
      toast.error('Error al cargar actividades');
    } finally {
      setIsLoading(false);
    }
  }, [contactoId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addActividad = async (payload: Omit<Actividad, 'id' | 'estado' | 'asignadoA'>) => {
    try {
      setIsSubmitting(true);
      await ProductivityService.createActividad(payload);
      await fetchItems();
      toast.success('Actividad agendada');
      return true;
    } catch {
      toast.error('Error al agendar actividad');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEstado = async (id: string, estado: EstadoActividad) => {
    try {
      setIsSubmitting(true);
      await ProductivityService.updateActividadEstado(id, estado);
      await fetchItems();
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error actualizando estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { data, isLoading, isSubmitting, addActividad, updateEstado, refresh: fetchItems };
};
