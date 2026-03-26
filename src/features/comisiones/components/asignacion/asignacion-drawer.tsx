'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'src/shared/components/ui/button';
import { X } from 'lucide-react';
import { type AsignacionPlan } from '../../types/comisiones.types';
import { type PlanComision } from '../../types/comisiones.types';
import { asignacionSchema, type AsignacionForm } from '../../schemas/asignacion.schema';

interface AsignacionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asignacion: AsignacionPlan | null;
  planesDisponibles: PlanComision[];
  onSave: (data: AsignacionForm) => Promise<boolean>;
}

export const AsignacionDrawer: React.FC<AsignacionDrawerProps> = ({
  isOpen,
  onClose,
  asignacion,
  planesDisponibles,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AsignacionForm>({
    resolver: zodResolver(asignacionSchema),
    mode: 'onChange',
  });

  const watchPlanId = useWatch({ control, name: 'planId' });
  const planInfo = planesDisponibles.find((p) => p.id === watchPlanId);

  useEffect(() => {
    if (isOpen && asignacion) {
      reset({
        id: asignacion.id,
        vendedorId: asignacion.vendedorId,
        vendedorNombre: asignacion.vendedorNombre,
        equipoId: asignacion.equipoId,
        equipoNombre: asignacion.equipoNombre,
        planId: asignacion.planId || '',
        planNombre: asignacion.planNombre || '',
        fechaInicio: asignacion.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: asignacion.fechaFin || '',
        estado: 'ACTIVO',
      });
    }
  }, [isOpen, asignacion, reset]);

  const onSubmit = async (data: AsignacionForm) => {
    // Buscar nombre del plan escogido
    if (data.planId) {
      const p = planesDisponibles.find((x) => x.id === data.planId);
      if (p) data.planNombre = p.nombre;
    }
    const success = await onSave(data);
    if (success) onClose();
  };

  if (!isOpen || !asignacion) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {asignacion.vendedorNombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{asignacion.vendedorNombre}</h2>
              <p className="text-sm text-gray-500">Equipo: {asignacion.equipoNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Plan de Comisión *</label>
            <select
              {...register('planId')}
              className={`w-full h-10 px-3 border rounded-md text-sm bg-white ${errors.planId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Seleccionar Plan --</option>
              {planesDisponibles
                .filter((p) => p.estado === 'ACTIVO')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.tipo})
                  </option>
                ))}
            </select>
            {errors.planId && <p className="text-xs text-red-500">{errors.planId.message}</p>}
          </div>

          {planInfo && (
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg text-sm">
              <p className="font-semibold text-gray-800 mb-1">Resumen del Plan Reservado</p>
              <ul className="text-gray-600 space-y-1">
                <li>
                  Tipo: <span className="font-medium">{planInfo.tipo}</span>
                </li>
                <li>
                  Base: <span className="font-medium">{planInfo.porcentajeBase}%</span>
                </li>
                <li>
                  Tramos Escalonados:{' '}
                  <span className="font-medium">{planInfo.tramos?.length} configurados</span>
                </li>
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Vigencia Inicio *</label>
              <input
                type="date"
                {...register('fechaInicio')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              />
              {errors.fechaInicio && (
                <p className="text-xs text-red-500">{errors.fechaInicio.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Vigencia Fin</label>
              <input
                type="date"
                {...register('fechaFin')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm text-gray-500"
              />
            </div>
          </div>
        </form>

        <div className="border-t p-4 shrink-0 flex justify-end gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Asignación'}
          </Button>
        </div>
      </div>
    </>
  );
};
