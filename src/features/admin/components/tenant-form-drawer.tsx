'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TenantFormData, tenantSchema } from 'src/features/admin/schemas/tenant.schema';
import { PlanSaaS, Tenant } from 'src/features/admin/types/admin.types';
import { formatMoney } from 'src/lib/currency';
import { Button } from 'src/shared/components/ui/button';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Icon } from 'src/shared/components/ui/icon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

const PAISES = ['México', 'Colombia', 'España', 'Argentina', 'Chile', 'Perú', 'Otro'].map((p) => ({
  value: p,
  label: p,
}));

interface TenantFormDrawerProps {
  tenant: Tenant | null;
  planes: PlanSaaS[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tenant>) => Promise<void>;
}

export function TenantFormDrawer({
  tenant,
  planes,
  isOpen,
  onClose,
  onSave,
}: TenantFormDrawerProps) {
  const isEditing = !!tenant;
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      nombre: '',
      dominio: '',
      pais: 'México',
      email_contacto: '',
      plan_uid: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      dias_trial: 0,
      admin_nombre: '',
      admin_email: '',
    },
  });

  const planUid = watch('plan_uid');
  const selectedPlan = planes.find((p) => p.uid === planUid);

  const planOptions = [
    { value: '', label: 'Seleccionar plan...' },
    ...planes.map((p) => ({
      value: p.uid,
      label: `${p.name} — ${formatMoney(p.price, { scope: 'platform', maximumFractionDigits: 0 })}/mes`,
    })),
  ];

  useEffect(() => {
    if (isOpen) {
      reset(
        tenant
          ? {
              nombre: tenant.nombre,
              dominio: tenant.dominio,
              pais: tenant.pais,
              email_contacto: tenant.email_contacto,
              plan_uid: tenant.plan_uid,
              fecha_inicio: tenant.created_at?.split('T')[0] ?? '',
              dias_trial: 0,
              admin_nombre: '',
              admin_email: '',
            }
          : {
              nombre: '',
              dominio: '',
              pais: 'México',
              email_contacto: '',
              plan_uid: '',
              fecha_inicio: new Date().toISOString().split('T')[0],
              dias_trial: 0,
              admin_nombre: '',
              admin_email: '',
            }
      );
    }
  }, [tenant, isOpen, reset]);

  const onSubmit = async (data: TenantFormData) => {
    const plan = planes.find((p) => p.uid === data.plan_uid);
    try {
      await onSave({
        nombre: data.nombre,
        dominio: data.dominio,
        pais: data.pais,
        email_contacto: data.email_contacto,
        plan_uid: data.plan_uid,
        plan_nombre: plan?.name ?? '',
        mrr: plan?.price ?? 0,
        estado: 'ACTIVO',
        total_usuarios: 1,
        limite_usuarios: plan?.max_users ?? 5,
        almacenamiento_usado_gb: 0,
        limite_almacenamiento_gb: plan?.features.storage_gb ?? 10,
      });
      toast.success(isEditing ? 'Tenant actualizado.' : 'Tenant creado.');
      onClose();
    } catch {
      toast.error('Error al procesar.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle>{isEditing ? `Editar Tenant: ${tenant?.nombre}` : 'Nuevo Tenant'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos del tenant'
              : 'Completa la información para crear un nuevo tenant'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Información general</h3>
              <div className="space-y-3">
                <FormInput
                  control={control}
                  name="nombre"
                  label="Nombre de empresa"
                  required
                  placeholder="Acme Corporation"
                />
                <FormInput
                  control={control}
                  name="dominio"
                  label="Dominio"
                  required
                  placeholder="acme.tucrm.com"
                />
                <FormSelectField
                  control={control}
                  name="pais"
                  label="País"
                  required
                  options={PAISES}
                />
                <FormInput
                  control={control}
                  name="email_contacto"
                  label="Email de contacto"
                  type="email"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Suscripción</h3>
              <div className="space-y-3">
                <FormSelectField
                  control={control}
                  name="plan_uid"
                  label="Plan"
                  required
                  options={planOptions}
                />
                {selectedPlan && (
                  <div className="rounded-xl bg-muted/50 border border-border/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Package" className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">
                        {selectedPlan.name} —{' '}
                        {formatMoney(selectedPlan.price, {
                          scope: 'platform',
                          maximumFractionDigits: 0,
                        })}
                        /mes
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.max_users ?? 'Ilimitados'} usuarios ·{' '}
                      {selectedPlan.features.storage_gb ?? 'Ilimitado'} GB ·{' '}
                      {selectedPlan.features.api_calls_month
                        ? `${(selectedPlan.features.api_calls_month / 1000).toFixed(0)}k`
                        : 'Ilimitadas'}{' '}
                      API calls/mes
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    control={control}
                    name="fecha_inicio"
                    label="Fecha de inicio"
                    type="date"
                  />
                  <FormInput
                    control={control}
                    name="dias_trial"
                    label="Días de trial"
                    type="number"
                  />
                </div>
              </div>
            </div>
            {!isEditing && (
              <div>
                <h3 className="text-sm font-semibold mb-4">Admin inicial del tenant</h3>
                <div className="space-y-3">
                  <FormInput
                    control={control}
                    name="admin_nombre"
                    label="Nombre del admin"
                    placeholder="Juan Pérez"
                  />
                  <FormInput
                    control={control}
                    name="admin_email"
                    label="Email del admin"
                    type="email"
                    placeholder="admin@empresa.com"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox id="sendCredentials" defaultChecked />
                    <label
                      htmlFor="sendCredentials"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Enviar credenciales por email
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <SheetFooter className="border-t border-border/40 px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Tenant'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
