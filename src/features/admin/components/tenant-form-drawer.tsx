'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { Tenant, PlanSaaS } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TenantFormDrawerProps {
  tenant: Tenant | null;
  planes: PlanSaaS[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tenant>) => Promise<void>;
}

const PAISES_OPTIONS = ['México', 'Colombia', 'España', 'Argentina', 'Chile', 'Perú', 'Otro'].map(
  (p) => ({ value: p, label: p })
);

export function TenantFormDrawer({
  tenant,
  planes,
  isOpen,
  onClose,
  onSave,
}: TenantFormDrawerProps) {
  const isEditing = !!tenant;
  const [isSaving, setIsSaving] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(true);

  const [form, setForm] = useState({
    nombre: '',
    dominio: '',
    pais: 'México',
    emailContacto: '',
    planId: '',
    diasTrial: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    adminNombre: '',
    adminEmail: '',
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        nombre: tenant.nombre,
        dominio: tenant.dominio,
        pais: tenant.pais,
        emailContacto: tenant.emailContacto,
        planId: tenant.planId,
        diasTrial: 0,
        fechaInicio: tenant.creadoEn,
        adminNombre: '',
        adminEmail: '',
      });
    } else {
      setForm({
        nombre: '',
        dominio: '',
        pais: 'México',
        emailContacto: '',
        planId: '',
        diasTrial: 0,
        fechaInicio: new Date().toISOString().split('T')[0],
        adminNombre: '',
        adminEmail: '',
      });
    }
  }, [tenant, isOpen]);

  const selectedPlan = planes.find((p) => p.id === form.planId);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await delay(800);
      const planSeleccionado = planes.find((p) => p.id === form.planId);
      await onSave({
        nombre: form.nombre,
        dominio: form.dominio,
        pais: form.pais,
        emailContacto: form.emailContacto,
        planId: form.planId,
        planNombre: planSeleccionado?.nombre || '',
        mrr: planSeleccionado?.precio || 0,
        estado: 'ACTIVO',
        totalUsuarios: 1,
        limiteUsuarios: planSeleccionado?.features.limiteUsuarios || 5,
        almacenamientoUsadoGB: 0,
        limiteAlmacenamientoGB: planSeleccionado?.features.almacenamientoGB || 10,
      });
      toast.success(isEditing ? 'Tenant actualizado exitosamente.' : 'Tenant creado exitosamente.');
      onClose();
    } catch {
      toast.error('Error al procesar. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const planOptions = [
    { value: '', label: 'Seleccionar plan...' },
    ...planes.map((p) => ({ value: p.id, label: `${p.nombre} — $${p.precio}/mes` })),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle>{isEditing ? `Editar Tenant: ${tenant.nombre}` : 'Nuevo Tenant'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos del tenant'
              : 'Completa la información para crear un nuevo tenant'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Información general */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Información general</h3>
            <div className="space-y-3">
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                label="Nombre de empresa"
                required
                placeholder="Acme Corporation"
              />
              <Input
                value={form.dominio}
                onChange={(e) => setForm({ ...form, dominio: e.target.value })}
                label="Dominio"
                required
                placeholder="acme.tucrm.com"
              />
              <SelectField
                value={form.pais}
                onChange={(val) => setForm({ ...form, pais: val as string })}
                label="País"
                required
                options={PAISES_OPTIONS}
              />
              <Input
                type="email"
                value={form.emailContacto}
                onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
                label="Email de contacto"
                required
                placeholder="admin@empresa.com"
              />
            </div>
          </div>

          {/* Suscripción */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Suscripción</h3>
            <div className="space-y-3">
              <SelectField
                value={form.planId}
                onChange={(val) => setForm({ ...form, planId: val as string })}
                label="Plan"
                required
                options={planOptions}
              />

              {selectedPlan && (
                <div className="rounded-xl bg-muted/50 border border-border/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Package" className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      {selectedPlan.nombre} — ${selectedPlan.precio}/mes
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlan.features.limiteUsuarios ?? 'Ilimitados'} usuarios ·{' '}
                    {selectedPlan.features.almacenamientoGB ?? 'Ilimitado'} GB ·{' '}
                    {selectedPlan.features.apiCallsMes
                      ? `${(selectedPlan.features.apiCallsMes / 1000).toFixed(0)}k`
                      : 'Ilimitadas'}{' '}
                    API calls/mes
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  label="Fecha de inicio"
                />
                <Input
                  type="number"
                  min={0}
                  value={String(form.diasTrial)}
                  onChange={(e) => setForm({ ...form, diasTrial: parseInt(e.target.value) || 0 })}
                  label="Días de trial"
                />
              </div>
            </div>
          </div>

          {/* Admin inicial (solo en creación) */}
          {!isEditing && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Admin inicial del tenant
              </h3>
              <div className="space-y-3">
                <Input
                  value={form.adminNombre}
                  onChange={(e) => setForm({ ...form, adminNombre: e.target.value })}
                  label="Nombre del admin"
                  required
                  placeholder="Juan Pérez"
                />
                <Input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  label="Email del admin"
                  required
                  placeholder="admin@empresa.com"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sendCredentials"
                    checked={sendCredentials}
                    onCheckedChange={(v) => setSendCredentials(v as boolean)}
                  />
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
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !form.nombre || !form.planId}>
            {isSaving ? 'Guardando...' : 'Guardar Tenant'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
