'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
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
import { Tenant, PlanSaaS } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TenantFormDrawerProps {
  tenant: Tenant | null;
  planes: PlanSaaS[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tenant>) => Promise<void>;
}

const PAISES = ['México', 'Colombia', 'España', 'Argentina', 'Chile', 'Perú', 'Otro'];

export function TenantFormDrawer({
  tenant,
  planes,
  isOpen,
  onClose,
  onSave,
}: TenantFormDrawerProps) {
  const isEditing = !!tenant;
  const [isSaving, setIsSaving] = useState(false);

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
          {/* Sección 1: Información general */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Información general</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  Nombre de empresa *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  Dominio *
                </label>
                <input
                  type="text"
                  value={form.dominio}
                  onChange={(e) => setForm({ ...form, dominio: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="acme.tucrm.com"
                />
              </div>
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  País *
                </label>
                <select
                  value={form.pais}
                  onChange={(e) => setForm({ ...form, pais: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                >
                  {PAISES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  Email de contacto *
                </label>
                <input
                  type="email"
                  value={form.emailContacto}
                  onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Suscripción */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Suscripción</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  Plan *
                </label>
                <select
                  value={form.planId}
                  onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                >
                  <option value="">Seleccionar plan...</option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — ${p.precio}/mes
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview plan */}
              {selectedPlan && (
                <div className="rounded-xl bg-muted/50 border border-border/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-body2 text-foreground">
                      {selectedPlan.nombre} — ${selectedPlan.precio}/mes
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
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
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Días de trial
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.diasTrial}
                    onChange={(e) => setForm({ ...form, diasTrial: parseInt(e.target.value) || 0 })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Admin inicial (solo en creación) */}
          {!isEditing && (
            <div>
              <h3 className="text-body2 font-semibold text-foreground mb-4">
                Admin inicial del tenant
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Nombre del admin *
                  </label>
                  <input
                    type="text"
                    value={form.adminNombre}
                    onChange={(e) => setForm({ ...form, adminNombre: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Email del admin *
                  </label>
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="admin@empresa.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sendCredentials" defaultChecked className="rounded" />
                  <label
                    htmlFor="sendCredentials"
                    className="text-caption text-muted-foreground cursor-pointer"
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
