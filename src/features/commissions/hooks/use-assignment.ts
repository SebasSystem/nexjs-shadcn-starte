import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { asignacionService } from '../services/assignment.service';
import type { AsignacionPlan } from '../types/commissions.types';

export const useAssignment = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAsignaciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await asignacionService.getAsignaciones();
      setAsignaciones(data);
    } catch (error) {
      toast.error('Error al cargar las asignaciones');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAsignaciones();
  }, [fetchAsignaciones]);

  const addAsignacion = async (data: Omit<AsignacionPlan, 'id'>) => {
    setIsSubmitting(true);
    try {
      const nueva = await asignacionService.createAsignacion(data);
      setAsignaciones((prev) => [...prev, nueva]);
      toast.success('Asignación creada exitosamente');
      return true;
    } catch {
      toast.error('Error al crear la asignación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAsignacion = async (id: string, data: Partial<AsignacionPlan>) => {
    setIsSubmitting(true);
    try {
      const updated = await asignacionService.updateAsignacion(id, data);
      setAsignaciones((prev) => prev.map((asg) => (asg.id === id ? { ...asg, ...updated } : asg)));
      toast.success('Asignación actualizada exitosamente');
      return true;
    } catch {
      toast.error('Error al actualizar la asignación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    asignaciones,
    isLoading,
    isSubmitting,
    fetchAsignaciones,
    addAsignacion,
    updateAsignacion,
  };
};
