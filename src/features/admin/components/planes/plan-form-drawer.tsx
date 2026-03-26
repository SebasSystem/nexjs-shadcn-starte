'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from 'src/shared/components/ui/switch';
import { PlanSaaS, TierPlan, SoportePlan } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PlanFormDrawerProps {
  plan: PlanSaaS | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PlanSaaS, 'id' | 'creadoEn' | 'totalTenants'>) => Promise<void>;
}

const MODULOS = [
  { key: 'ventas', label: 'Ventas' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'rh', label: 'RH / Comisiones' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'multi-currency', label: 'Multi-currency' },
  { key: 'api-publica', label: 'API Pública' },
];

const TIERS: TierPlan[] = ['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

export function PlanFormDrawer({ plan, isOpen, onClose, onSave }: PlanFormDrawerProps) {
  const isEditing = !!plan;
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    tier: 'STARTER' as TierPlan,
    precio: 49,
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'LEGADO',
    limiteUsuarios: 5,
    ilimitadoUsuarios: false,
    almacenamientoGB: 10,
    ilimitadoAlmacenamiento: false,
    apiCallsMes: 10000,
    ilimitadoApi: false,
    modulos: ['ventas'] as string[],
    soporte: 'EMAIL' as SoportePlan,
    customDomain: false,
    sso: false,
    reportesAvanzados: false,
    slaUptime: null as number | null,
  });

  useEffect(() => {
    if (plan) {
      setForm({
        nombre: plan.nombre,
        tier: plan.tier,
        precio: plan.precio,
        estado: plan.estado,
        limiteUsuarios: plan.features.limiteUsuarios ?? 5,
        ilimitadoUsuarios: plan.features.limiteUsuarios === null,
        almacenamientoGB: plan.features.almacenamientoGB ?? 10,
        ilimitadoAlmacenamiento: plan.features.almacenamientoGB === null,
        apiCallsMes: plan.features.apiCallsMes ?? 10000,
        ilimitadoApi: plan.features.apiCallsMes === null,
        modulos: plan.features.modulos,
        soporte: plan.features.soporte,
        customDomain: plan.features.customDomain,
        sso: plan.features.sso,
        reportesAvanzados: plan.features.reportesAvanzados,
        slaUptime: plan.features.slaUptime,
      });
    } else {
      setForm({
        nombre: '',
        tier: 'STARTER',
        precio: 49,
        estado: 'ACTIVO',
        limiteUsuarios: 5,
        ilimitadoUsuarios: false,
        almacenamientoGB: 10,
        ilimitadoAlmacenamiento: false,
        apiCallsMes: 10000,
        ilimitadoApi: false,
        modulos: ['ventas'],
        soporte: 'EMAIL',
        customDomain: false,
        sso: false,
        reportesAvanzados: false,
        slaUptime: null,
      });
    }
  }, [plan, isOpen]);

  const toggleModulo = (key: string) => {
    setForm((prev) => ({
      ...prev,
      modulos: prev.modulos.includes(key)
        ? prev.modulos.filter((m) => m !== key)
        : [...prev.modulos, key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await delay(800);
      await onSave({
        nombre: form.nombre,
        tier: form.tier,
        precio: form.precio,
        intervalo: 'MENSUAL',
        estado: form.estado,
        features: {
          limiteUsuarios: form.ilimitadoUsuarios ? null : form.limiteUsuarios,
          almacenamientoGB: form.ilimitadoAlmacenamiento ? null : form.almacenamientoGB,
          apiCallsMes: form.ilimitadoApi ? null : form.apiCallsMes,
          modulos: form.modulos,
          soporte: form.soporte,
          slaUptime: form.slaUptime,
          customDomain: form.customDomain,
          sso: form.sso,
          reportesAvanzados: form.reportesAvanzados,
        },
      });
      toast.success('Plan guardado correctamente.');
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
          <SheetTitle>{isEditing ? `Editar Plan: ${plan.nombre}` : 'Nuevo Plan'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica la configuración del plan'
              : 'Define las características y límites del nuevo plan'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Sección 1: Información general */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Información general</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-1">
                  Nombre del plan *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Plan Pro"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Tier *
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value as TierPlan })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Precio mensual (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={form.precio}
                      onChange={(e) =>
                        setForm({ ...form, precio: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full border border-border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-body2 font-medium text-foreground">Estado activo</label>
                <Switch
                  checked={form.estado === 'ACTIVO'}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, estado: checked ? 'ACTIVO' : 'INACTIVO' })
                  }
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Límites */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Límites</h3>
            <div className="space-y-3">
              {/* Usuarios */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Límite usuarios
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.limiteUsuarios}
                    disabled={form.ilimitadoUsuarios}
                    onChange={(e) =>
                      setForm({ ...form, limiteUsuarios: parseInt(e.target.value) || 1 })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-caption text-muted-foreground mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ilimitadoUsuarios}
                    onChange={(e) => setForm({ ...form, ilimitadoUsuarios: e.target.checked })}
                    className="rounded"
                  />
                  Ilimitado
                </label>
              </div>

              {/* Almacenamiento */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    Almacenamiento (GB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.almacenamientoGB}
                    disabled={form.ilimitadoAlmacenamiento}
                    onChange={(e) =>
                      setForm({ ...form, almacenamientoGB: parseInt(e.target.value) || 1 })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-caption text-muted-foreground mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ilimitadoAlmacenamiento}
                    onChange={(e) =>
                      setForm({ ...form, ilimitadoAlmacenamiento: e.target.checked })
                    }
                    className="rounded"
                  />
                  Ilimitado
                </label>
              </div>

              {/* API */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-caption font-medium text-muted-foreground mb-1">
                    API calls/mes
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={form.apiCallsMes}
                    disabled={form.ilimitadoApi}
                    onChange={(e) =>
                      setForm({ ...form, apiCallsMes: parseInt(e.target.value) || 1000 })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-caption text-muted-foreground mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ilimitadoApi}
                    onChange={(e) => setForm({ ...form, ilimitadoApi: e.target.checked })}
                    className="rounded"
                  />
                  Ilimitado
                </label>
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Módulos incluidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {MODULOS.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-2 text-body2 text-foreground cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.modulos.includes(m.key)}
                    onChange={() => toggleModulo(m.key)}
                    className="rounded"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {/* Opciones booleanas */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Opciones avanzadas</h3>
            <div className="space-y-3">
              {[
                { key: 'customDomain', label: 'Custom Domain' },
                { key: 'sso', label: 'SSO / SAML' },
                { key: 'reportesAvanzados', label: 'Reportes Avanzados' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-body2 text-foreground">{label}</span>
                  <Switch
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={(checked) => setForm({ ...form, [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-body2 font-semibold text-foreground mb-4">Tipo de soporte</h3>
            <div className="space-y-2">
              {[
                { value: 'EMAIL', label: 'Solo Email' },
                { value: 'EMAIL_CHAT', label: 'Email + Chat' },
                { value: 'DEDICADO', label: 'Soporte Dedicado' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-body2 text-foreground cursor-pointer"
                >
                  <input
                    type="radio"
                    name="soporte"
                    value={opt.value}
                    checked={form.soporte === opt.value}
                    onChange={() => setForm({ ...form, soporte: opt.value as SoportePlan })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border/40 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !form.nombre}>
            {isSaving ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
