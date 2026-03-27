import { useState, useCallback, useEffect } from 'react';
import type { Actividad, EstadoActividad } from '../types/productividad.types';
import { ProductividadService } from '../services/productividad.service';
import { toast } from 'sonner';

export const useActividades = (contactoId?: string) => {
  const [data, setData] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await ProductividadService.getActividades(contactoId);
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
      await ProductividadService.createActividad(payload);
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
      await ProductividadService.updateActividadEstado(id, estado);
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
