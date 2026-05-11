'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { Button } from 'src/shared/components/ui/button';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { useDebounce } from 'use-debounce';

import { type PlanForm, planSchema } from '../../schemas/plan.schema';
import type { CommissionPlan } from '../../types/commissions.types';

interface PlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: CommissionPlan | null;
  onSave: (data: PlanForm) => Promise<boolean>;
}

const TIPO_OPTIONS = [
  { value: 'sale', label: 'Por Venta (Monto)' },
  { value: 'margin', label: 'Por Margen (Ganancia)' },
  { value: 'target', label: 'Por Meta (KPI)' },
];

export const PlanDrawer: React.FC<PlanDrawerProps> = ({ isOpen, onClose, plan, onSave }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      type: 'sale',
      base_percentage: 0,
      role_uids: [],
      starts_at: '',
      ends_at: '',
      tiers: [{ threshold: 0, percent: 0 }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tiers' });

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        reset({
          uid: plan.uid,
          name: plan.name,
          type: plan.type,
          base_percentage: plan.base_percentage,
          role_uids: plan.role_uids ?? [],
          starts_at: plan.starts_at || '',
          ends_at: plan.ends_at || '',
          tiers: plan.tiers,
        });
      } else {
        reset({
          name: '',
          type: 'sale',
          base_percentage: 1,
          role_uids: [],
          starts_at: new Date().toISOString().split('T')[0],
          tiers: [{ threshold: 0, percent: 1 }],
        });
      }
    }
  }, [isOpen, plan, reset]);

  const onSubmit = async (data: PlanForm) => {
    const success = await onSave(data);
    if (success) onClose();
  };

  const planType = useWatch({ control, name: 'type' });

  const [roleSearch, setRoleSearch] = useState('');
  const [debouncedRoleSearch] = useDebounce(roleSearch, 300);

  const { data: rolesData } = useQuery({
    queryKey: ['rbac-roles', debouncedRoleSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.rbac.roles, {
        params: debouncedRoleSearch ? { search: debouncedRoleSearch } : undefined,
      });
      const raw = res.data?.data ?? res.data;
      return (Array.isArray(raw) ? raw : (raw?.data ?? [])) as { uid: string; name: string }[];
    },
    staleTime: 0,
  });

  const roleOptions = (rolesData ?? []).map((r) => ({ value: r.uid, label: r.name }));

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
                name="name"
                label="Nombre del Plan"
                required
                placeholder="Ej. Plan Semestral 2025"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelectField
                  control={control}
                  name="type"
                  label="Tipo"
                  required
                  options={TIPO_OPTIONS}
                />

                <Input
                  type="text"
                  inputMode="decimal"
                  {...register('base_percentage', { valueAsNumber: true })}
                  label="% Base"
                  required
                  rightIcon={<span className="text-muted-foreground text-sm">%</span>}
                  error={errors.base_percentage?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Roles Aplicables <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="role_uids"
                  render={({ field }) => (
                    <SelectField
                      multiple
                      searchable
                      options={roleOptions}
                      value={field.value as string[]}
                      onChange={(val) => field.onChange(val)}
                      onSearch={setRoleSearch}
                      placeholder="Seleccionar roles..."
                    />
                  )}
                />
                {errors.role_uids && (
                  <p className="text-xs text-destructive">{errors.role_uids.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={control}
                  name="starts_at"
                  type="date"
                  label="Vigencia Inicio"
                  required
                />
                <FormInput control={control} name="ends_at" type="date" label="Vigencia Fin" />
              </div>
            </section>

            {/* Tramos Escalonados */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                2. Tramos Escalonados
              </h3>
              <p className="text-xs text-muted-foreground">
                Define umbrales de ventas y el porcentaje de comisión que aplica.
              </p>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start bg-muted/30 p-3 rounded-md border border-border/40"
                  >
                    <div className="flex-1">
                      <Input
                        label="Umbral"
                        type="text"
                        inputMode="decimal"
                        size="sm"
                        {...register(`tiers.${index}.threshold`, { valueAsNumber: true })}
                        leftIcon={<span className="text-muted-foreground text-xs">$</span>}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="% Aplicado"
                        type="text"
                        inputMode="decimal"
                        size="sm"
                        {...register(`tiers.${index}.percent`, { valueAsNumber: true })}
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
              {errors.tiers && <p className="text-xs text-destructive">{errors.tiers.message}</p>}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ threshold: 0, percent: 1 })}
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
                  Tipo: <span className="font-medium text-foreground">{planType}</span>
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
