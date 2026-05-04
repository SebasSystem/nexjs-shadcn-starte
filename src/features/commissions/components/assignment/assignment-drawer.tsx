'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from 'src/shared/components/ui/button';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

import { type AssignmentForm, assignmentSchema } from '../../schemas/assignment.schema';
import { type AsignacionPlan } from '../../types/commissions.types';
import { type PlanComision } from '../../types/commissions.types';

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
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
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

  const planOptions = [
    { value: '', label: '-- Seleccionar Plan --' },
    ...planesDisponibles
      .filter((p) => p.estado === 'ACTIVO')
      .map((p) => ({ value: p.id, label: `${p.nombre} (${p.tipo})` })),
  ];

  return (
    <Sheet open={isOpen && !!asignacion} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
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
            <FormSelectField
              control={control}
              name="planId"
              label="Plan de Comisión"
              required
              options={planOptions}
            />

            {planInfo && (
              <div className="bg-muted/40 p-4 border border-border/40 rounded-lg text-sm">
                <p className="font-semibold text-foreground mb-1">Resumen del Plan</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>
                    Tipo: <span className="font-medium text-foreground">{planInfo.tipo}</span>
                  </li>
                  <li>
                    Base:{' '}
                    <span className="font-medium text-foreground">{planInfo.porcentajeBase}%</span>
                  </li>
                  <li>
                    Tramos Escalonados:{' '}
                    <span className="font-medium text-foreground">
                      {planInfo.tramos?.length} configurados
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={control}
                name="fechaInicio"
                type="date"
                label="Vigencia Inicio"
                required
              />
              <FormInput control={control} name="fechaFin" type="date" label="Vigencia Fin" />
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
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Asignación'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
