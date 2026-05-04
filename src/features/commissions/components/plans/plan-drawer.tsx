'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button } from 'src/shared/components/ui/button';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

import { type PlanComisionForm, planComisionSchema } from '../../schemas/plan.schema';
import { type PlanComision } from '../../types/commissions.types';

interface PlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PlanComision | null;
  onSave: (data: PlanComisionForm) => Promise<boolean>;
}

const TIPO_OPTIONS = [
  { value: 'VENTA', label: 'Por Venta (Monto)' },
  { value: 'MARGEN', label: 'Por Margen (Ganancia)' },
  { value: 'META', label: 'Por Meta (KPI)' },
];

export const PlanDrawer: React.FC<PlanDrawerProps> = ({ isOpen, onClose, plan, onSave }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PlanComisionForm>({
    resolver: zodResolver(planComisionSchema),
    defaultValues: {
      nombre: '',
      tipo: 'VENTA',
      porcentajeBase: 0,
      rolesAplicables: [],
      fechaInicio: '',
      fechaFin: '',
      estado: 'ACTIVO',
      tramos: [{ desde: 0, hasta: null, porcentajeAplicado: 0 }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tramos' });

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        reset({
          id: plan.id,
          nombre: plan.nombre,
          tipo: plan.tipo,
          porcentajeBase: plan.porcentajeBase,
          rolesAplicables: plan.rolesAplicables.length ? plan.rolesAplicables : [],
          fechaInicio: plan.fechaInicio || '',
          fechaFin: plan.fechaFin || '',
          estado: plan.estado,
          tramos: plan.tramos,
        });
      } else {
        reset({
          nombre: '',
          tipo: 'VENTA',
          porcentajeBase: 1,
          rolesAplicables: ['Vendedor'],
          fechaInicio: new Date().toISOString().split('T')[0],
          estado: 'ACTIVO',
          tramos: [{ desde: 0, hasta: null, porcentajeAplicado: 1 }],
        });
      }
    }
  }, [isOpen, plan, reset]);

  const onSubmit = async (data: PlanComisionForm) => {
    const success = await onSave(data);
    if (success) onClose();
  };

  const tipo = useWatch({ control, name: 'tipo' });

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle>{plan ? 'Editar Plan' : 'Nuevo Plan de Comisión'}</SheetTitle>
          <SheetDescription>Completa los campos para definir las reglas del plan</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-8">
            {/* Información General */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                1. Información General
              </h3>

              <FormInput
                control={control}
                name="nombre"
                label="Nombre del Plan"
                required
                placeholder="Ej. Plan Semestral 2025"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelectField
                  control={control}
                  name="tipo"
                  label="Tipo"
                  required
                  options={TIPO_OPTIONS}
                />

                {/* porcentajeBase usa register + valueAsNumber */}
                <Input
                  type="number"
                  step="0.01"
                  {...register('porcentajeBase', { valueAsNumber: true })}
                  label="% Base"
                  required
                  rightIcon={<span className="text-muted-foreground text-sm">%</span>}
                  error={errors.porcentajeBase?.message}
                />
              </div>

              {/* rolesAplicables usa register + setValueAs */}
              <Input
                type="text"
                {...register('rolesAplicables', {
                  setValueAs: (v) =>
                    typeof v === 'string'
                      ? v
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : v,
                })}
                label="Roles Aplicables"
                required
                hint="Separados por coma"
                placeholder="Ej. Vendedor, Gerente"
                error={errors.rolesAplicables?.message}
              />

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
            </section>

            {/* Tramos Escalonados */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                2. Tramos Escalonados
              </h3>
              <p className="text-xs text-muted-foreground">
                Define rangos de ventas y el porcentaje de comisión que aplica.
              </p>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start bg-muted/30 p-3 rounded-md border border-border/40"
                  >
                    <div className="flex-1">
                      <Input
                        label="Desde"
                        type="number"
                        size="sm"
                        {...register(`tramos.${index}.desde`, { valueAsNumber: true })}
                        leftIcon={<span className="text-muted-foreground text-xs">$</span>}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Hasta"
                        type="number"
                        size="sm"
                        placeholder="∞"
                        {...register(`tramos.${index}.hasta`, {
                          setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                        })}
                        leftIcon={<span className="text-muted-foreground text-xs">$</span>}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="% Aplicado"
                        type="number"
                        step="0.01"
                        size="sm"
                        {...register(`tramos.${index}.porcentajeAplicado`, {
                          valueAsNumber: true,
                        })}
                        rightIcon={<span className="text-muted-foreground text-xs">%</span>}
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {errors.tramos && <p className="text-xs text-destructive">{errors.tramos.message}</p>}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ desde: 0, hasta: null, porcentajeAplicado: 1 })}
                className="border-dashed w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" /> Agregar Tramo
              </Button>
            </section>

            {/* Vista Previa */}
            <section className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-sm">
              <h4 className="font-semibold text-foreground mb-2">Vista Previa</h4>
              <div className="text-muted-foreground space-y-1">
                <p>
                  Tipo: <span className="font-medium text-foreground">{tipo}</span>
                </p>
                <p>
                  Tramos configurados:{' '}
                  <span className="font-medium text-foreground">{fields.length}</span>
                </p>
              </div>
            </section>
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
            {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
