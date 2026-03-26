'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'src/shared/components/ui/button';
import { X, Trash2, Plus } from 'lucide-react';
import { type PlanComision } from '../../types/comisiones.types';
import { planComisionSchema, type PlanComisionForm } from '../../schemas/plan.schema';

interface PlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PlanComision | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => Promise<boolean>;
}

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tramos',
  });

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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold">{plan ? 'Editar Plan' : 'Nuevo Plan de Comisión'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Completa los campos para definir las reglas del plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
        >
          {/* Información General */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
              1. Información General
            </h3>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre del Plan *</label>
              <input
                {...register('nombre')}
                className={`w-full h-10 px-3 border rounded-md text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. Plan Semestral 2025"
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <select
                  {...register('tipo')}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="VENTA">Por Venta (Monto)</option>
                  <option value="MARGEN">Por Margen (Ganancia)</option>
                  <option value="META">Por Meta (KPI)</option>
                </select>
                {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">% Base *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    {...register('porcentajeBase', { valueAsNumber: true })}
                    className={`w-full h-10 pl-3 pr-8 border rounded-md text-sm ${errors.porcentajeBase ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
                {errors.porcentajeBase && (
                  <p className="text-xs text-red-500">{errors.porcentajeBase.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Roles Aplicables *{' '}
                <span className="text-xs font-normal text-gray-400">(Separados por coma)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Vendedor, Gerente"
                {...register('rolesAplicables', {
                  setValueAs: (v) =>
                    typeof v === 'string'
                      ? v
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : v,
                })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              />
              {errors.rolesAplicables && (
                <p className="text-xs text-red-500">{errors.rolesAplicables.message}</p>
              )}
            </div>

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
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm text-gray-400 focus:text-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Tramos Escalonados */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
              2. Tramos Escalonados
            </h3>
            <p className="text-xs text-gray-500">
              Define rangos de ventas y el porcentaje de comisión que aplica.
            </p>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start bg-gray-50 p-3 rounded-md border border-gray-100"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-gray-500">Desde</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        {...register(`tramos.${index}.desde`, { valueAsNumber: true })}
                        className="w-full h-8 pl-6 pr-2 text-sm border rounded"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-gray-500">Hasta</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="∞"
                        {...register(`tramos.${index}.hasta`, {
                          setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                        })}
                        className="w-full h-8 pl-6 pr-2 text-sm border rounded"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-gray-500">% Aplicado</label>
                    <div className="relative">
                      <span className="absolute right-2.5 top-2 text-gray-500 text-xs">%</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`tramos.${index}.porcentajeAplicado`, { valueAsNumber: true })}
                        className="w-full h-8 pr-6 pl-2 text-sm border rounded"
                      />
                    </div>
                  </div>
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.tramos && <p className="text-xs text-red-500">{errors.tramos.message}</p>}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ desde: 0, hasta: null, porcentajeAplicado: 1 })}
              className="text-blue-600 border-dashed border-blue-200 hover:bg-blue-50 w-full"
            >
              <Plus size={16} className="mr-2" /> Agregar Tramo
            </Button>
          </section>

          {/* Vista Previa */}
          <section className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Vista Previa</h4>
            <div className="text-blue-800 space-y-1 opacity-80">
              <p>
                Tipo: <span className="font-medium">{tipo}</span>
              </p>
              <p>
                Tramos configurados: <span className="font-medium">{fields.length}</span>
              </p>
            </div>
          </section>

          <div className="h-10 shrink-0" />
        </form>

        <div className="border-t p-4 shrink-0 flex items-center justify-end gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </div>
      </div>
    </>
  );
};
