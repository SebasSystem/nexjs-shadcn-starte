'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from 'src/shared/components/ui/button';
import { Checkbox } from 'src/shared/components/ui/checkbox';
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

import type { CommissionPlan } from '../../types/commissions.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planesDisponibles: CommissionPlan[];
}

export const BulkAssignmentDrawer: React.FC<Props> = ({ isOpen, onClose, planesDisponibles }) => {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [equipoFiltro, setEquipoFiltro] = useState('');
  const [selectedVendedores, setSelectedVendedores] = useState<string[]>([]);
  const [planId, setPlanId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [guardando, setGuardando] = useState(false);

  // TODO: Conectar con backend cuando los siguientes endpoints estén disponibles
  // con los permisos adecuados para el rol actual:
  //   - GET  /teams              → lista de equipos (requiere permiso 'teams.read')
  //   - GET  /users              → lista de vendedores (requiere permiso 'users.manage')
  //   - POST /commissions/assignments → crear asignación masiva (requiere 'commissions.manage')
  // Mientras tanto, los datos son placeholders y la UI es solo demostrativa.
  const equipos: string[] = [];
  const vendedoresFiltrados: { id: string; nombre: string; equipo: string }[] = [];

  const planSeleccionado = planesDisponibles.find((p) => p.uid === planId);

  const toggleVendedor = (id: string) => {
    setSelectedVendedores((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    const ids = vendedoresFiltrados.map((v) => v.id);
    const todosSeleccionados = ids.every((id) => selectedVendedores.includes(id));
    if (todosSeleccionados) {
      setSelectedVendedores((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedVendedores((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleConfirmar = async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 1200));
    setGuardando(false);
    toast.success(
      `Plan "${planSeleccionado?.name}" asignado a ${selectedVendedores.length} vendedor(es).`
    );
    handleClose();
  };

  const handleClose = () => {
    setPaso(1);
    setEquipoFiltro('');
    setSelectedVendedores([]);
    setPlanId('');
    setFechaInicio('');
    setFechaFin('');
    onClose();
  };

  const puedeAvanzarPaso1 = selectedVendedores.length > 0;
  const puedeAvanzarPaso2 = !!planId && !!fechaInicio;
  const nombresSeleccionados: { id: string; nombre: string; equipo: string }[] = [];

  const equipoOptions = [
    { value: '', label: 'Todos los equipos' },
    ...equipos.map((eq) => ({ value: eq, label: eq })),
  ];

  const planOptions = [
    { value: '', label: '-- Seleccionar Plan --' },
    ...planesDisponibles.filter((p) => p.is_active).map((p) => ({ value: p.uid, label: p.name })),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-3">
            <Icon name="Users" size={20} className="text-primary shrink-0" />
            <div>
              <SheetTitle>Asignación Masiva</SheetTitle>
              <SheetDescription>Asigna un plan a varios vendedores a la vez</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-0 px-6 py-3 border-b bg-background shrink-0">
          {[
            { n: 1, label: 'Vendedores' },
            { n: 2, label: 'Plan' },
            { n: 3, label: 'Confirmar' },
          ].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    paso >= n
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`text-xs font-medium ${paso >= n ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border mx-2" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          {/* Banner de funcionalidad en desarrollo */}
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Funcionalidad en desarrollo</span> — requiere
            integración con backend. Los endpoints necesarios están documentados en el código fuente
            (ver TODOs en{' '}
            <code className="bg-amber-100 px-1 rounded text-xs">bulk-assignment-drawer.tsx</code>).
          </div>

          {/* PASO 1: Seleccionar vendedores */}
          {paso === 1 && (
            <div className="space-y-4">
              <SelectField
                value={equipoFiltro}
                onChange={(val) => setEquipoFiltro(val as string)}
                label="Filtrar por equipo"
                options={equipoOptions}
              />

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
                  <Checkbox
                    id="seleccionarTodos"
                    checked={vendedoresFiltrados.every((v) => selectedVendedores.includes(v.id))}
                    onCheckedChange={toggleTodos}
                  />
                  <label
                    htmlFor="seleccionarTodos"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer"
                  >
                    Seleccionar todos ({vendedoresFiltrados.length})
                  </label>
                </div>
                {vendedoresFiltrados.map((v) => (
                  <label
                    key={v.id}
                    htmlFor={`vend-${v.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      id={`vend-${v.id}`}
                      checked={selectedVendedores.includes(v.id)}
                      onCheckedChange={() => toggleVendedor(v.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {v.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.nombre}</p>
                      <p className="text-xs text-muted-foreground">{v.equipo}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedVendedores.length > 0 && (
                <p className="text-sm text-primary font-medium">
                  {selectedVendedores.length} vendedor(es) seleccionado(s)
                </p>
              )}
            </div>
          )}

          {/* PASO 2: Seleccionar plan y fechas */}
          {paso === 2 && (
            <div className="space-y-5">
              <SelectField
                value={planId}
                onChange={(val) => setPlanId(val as string)}
                label="Plan de Comisión"
                required
                options={planOptions}
              />

              {planSeleccionado && (
                <div className="bg-muted/40 border border-border/40 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-foreground">{planSeleccionado.name}</p>
                  <p className="text-muted-foreground">
                    Tipo:{' '}
                    <span className="font-medium text-foreground">{planSeleccionado.type}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Base:{' '}
                    <span className="font-medium text-foreground">
                      {planSeleccionado.base_percentage}%
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Tramos:{' '}
                    <span className="font-medium text-foreground">
                      {planSeleccionado.tiers.length} configurados
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  label="Vigencia Inicio"
                  required
                />
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  label="Vigencia Fin"
                />
              </div>
            </div>
          )}

          {/* PASO 3: Resumen y confirmación */}
          {paso === 3 && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-bold text-foreground">Resumen de Asignación</p>
                <p className="text-sm text-muted-foreground">
                  Asignarás el plan{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{planSeleccionado?.name}&quot;
                  </span>{' '}
                  a{' '}
                  <span className="font-semibold text-foreground">
                    {selectedVendedores.length} vendedor(es)
                  </span>
                  {fechaInicio && (
                    <>
                      , vigente desde el{' '}
                      <span className="font-semibold text-foreground">{fechaInicio}</span>
                    </>
                  )}
                  {fechaFin && (
                    <>
                      {' '}
                      hasta el <span className="font-semibold text-foreground">{fechaFin}</span>
                    </>
                  )}
                  {!fechaFin && ' de forma indefinida'}.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Vendedores
                </p>
                <div className="space-y-2">
                  {nombresSeleccionados.map((v) => (
                    <div key={v.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {v.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.nombre}</p>
                        <p className="text-xs text-muted-foreground">{v.equipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="justify-between">
          {paso > 1 ? (
            <Button variant="outline" onClick={() => setPaso((p) => (p - 1) as 1 | 2 | 3)}>
              <Icon name="ChevronLeft" size={16} className="mr-1" /> Atrás
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {paso < 3 ? (
            <Button
              disabled={paso === 1 ? !puedeAvanzarPaso1 : !puedeAvanzarPaso2}
              onClick={() => setPaso((p) => (p + 1) as 1 | 2 | 3)}
            >
              Siguiente <Icon name="ChevronRight" size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleConfirmar} disabled={guardando}>
              {guardando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Confirmar Asignación'
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
