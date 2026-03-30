'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'src/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { type AsignacionPlan } from '../../types/commissions.types';
import { type PlanComision } from '../../types/commissions.types';
import { assignmentSchema, type AssignmentForm } from '../../schemas/assignment.schema';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asignacion: AsignacionPlan | null;
  planesDisponibles: PlanComision[];
  onSave: (data: AssignmentForm) => Promise<boolean>;
}

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
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
  } = useForm<AssignmentForm>({
    resolver: zodResolver(assignmentSchema),
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

  const onSubmit = async (data: AssignmentForm) => {
    if (data.planId) {
      const p = planesDisponibles.find((x) => x.id === data.planId);
      if (p) data.planNombre = p.nombre;
    }
    const success = await onSave(data);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen && !!asignacion} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
              {asignacion?.vendedorNombre.charAt(0)}
            </div>
            <div>
              <SheetTitle>{asignacion?.vendedorNombre}</SheetTitle>
              <SheetDescription>Equipo: {asignacion?.equipoNombre}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-6">
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
                <p className="font-semibold text-gray-800 mb-1">Resumen del Plan</p>
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
          </div>
        </div>

        <SheetFooter>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
