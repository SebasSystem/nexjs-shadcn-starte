import { useState, useCallback, useEffect } from 'react';
import type { PlanComision } from '../types/commissions.types';
import { planesService } from '../services/plans.service';
import { toast } from 'sonner';

export const usePlans = () => {
  const [planes, setPlanes] = useState<PlanComision[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPlanes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await planesService.getPlanes();
      setPlanes(data);
    } catch (error) {
      toast.error('Error al cargar los planes de comisión');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const addPlan = async (data: Omit<PlanComision, 'id'>) => {
    setIsSubmitting(true);
    try {
      const newPlan = await planesService.createPlan(data);
      setPlanes((prev) => [...prev, newPlan]);
      toast.success('Plan creado correctamente');
      return true;
    } catch {
      toast.error('Error al crear el plan');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePlan = async (id: string, data: Partial<PlanComision>) => {
    setIsSubmitting(true);
    try {
      const updated = await planesService.updatePlan(id, data);
      setPlanes((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...updated } : plan)));
      toast.success('Plan actualizado correctamente');
      return true;
    } catch {
      toast.error('Error al actualizar el plan');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePlan = async (id: string) => {
    setIsSubmitting(true);
    try {
      await planesService.deletePlan(id);
      setPlanes((prev) => prev.filter((p) => p.id !== id));
      toast.success('Plan eliminado correctamente');
      return true;
    } catch {
      toast.error('Error al eliminar el plan');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    planes,
    isLoading,
    isSubmitting,
    fetchPlanes,
    addPlan,
    updatePlan,
    deletePlan,
  };
};
