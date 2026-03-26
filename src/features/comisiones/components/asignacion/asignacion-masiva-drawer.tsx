'use client';

import React, { useState } from 'react';
import { X, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import type { PlanComision } from '../../types/comisiones.types';
import { toast } from 'sonner';

const MOCK_VENDEDORES = [
  { id: 'vend-1', nombre: 'Carlos Martínez', equipo: 'Ventas Norte' },
  { id: 'vend-2', nombre: 'Ana Gómez', equipo: 'Ventas Sur' },
  { id: 'vend-3', nombre: 'Luis Pérez', equipo: 'Ventas Norte' },
  { id: 'vend-4', nombre: 'María Torres', equipo: 'Ventas Sur' },
  { id: 'vend-5', nombre: 'Jorge Ruiz', equipo: 'Ventas Centro' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planesDisponibles: PlanComision[];
}

export const AsignacionMasivaDrawer: React.FC<Props> = ({ isOpen, onClose, planesDisponibles }) => {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [equipoFiltro, setEquipoFiltro] = useState('');
  const [selectedVendedores, setSelectedVendedores] = useState<string[]>([]);
  const [planId, setPlanId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [guardando, setGuardando] = useState(false);

  const equipos = Array.from(new Set(MOCK_VENDEDORES.map((v) => v.equipo)));
  const vendedoresFiltrados = equipoFiltro
    ? MOCK_VENDEDORES.filter((v) => v.equipo === equipoFiltro)
    : MOCK_VENDEDORES;

  const planSeleccionado = planesDisponibles.find((p) => p.id === planId);

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
      `Plan "${planSeleccionado?.nombre}" asignado a ${selectedVendedores.length} vendedor(es).`
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

  const nombresSeleccionados = MOCK_VENDEDORES.filter((v) => selectedVendedores.includes(v.id));

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Asignación Masiva</h2>
              <p className="text-xs text-gray-500">Asigna un plan a varios vendedores a la vez</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-0 px-6 py-3 border-b bg-white shrink-0">
          {[
            { n: 1, label: 'Vendedores' },
            { n: 2, label: 'Plan' },
            { n: 3, label: 'Confirmar' },
          ].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    paso >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`text-xs font-medium ${paso >= n ? 'text-blue-700' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* PASO 1: Seleccionar vendedores */}
          {paso === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Filtrar por equipo</label>
                <select
                  value={equipoFiltro}
                  onChange={(e) => setEquipoFiltro(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Todos los equipos</option>
                  {equipos.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b">
                  <input
                    type="checkbox"
                    checked={vendedoresFiltrados.every((v) => selectedVendedores.includes(v.id))}
                    onChange={toggleTodos}
                  />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Seleccionar todos ({vendedoresFiltrados.length})
                  </span>
                </div>
                {vendedoresFiltrados.map((v) => (
                  <label
                    key={v.id}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendedores.includes(v.id)}
                      onChange={() => toggleVendedor(v.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {v.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{v.nombre}</p>
                      <p className="text-xs text-gray-500">{v.equipo}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedVendedores.length > 0 && (
                <p className="text-sm text-blue-700 font-medium">
                  {selectedVendedores.length} vendedor(es) seleccionado(s)
                </p>
              )}
            </div>
          )}

          {/* PASO 2: Seleccionar plan y fechas */}
          {paso === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Plan de Comisión *</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
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
              </div>

              {planSeleccionado && (
                <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-gray-800">{planSeleccionado.nombre}</p>
                  <p className="text-gray-600">
                    Tipo: <span className="font-medium">{planSeleccionado.tipo}</span>
                  </p>
                  <p className="text-gray-600">
                    Base: <span className="font-medium">{planSeleccionado.porcentajeBase}%</span>
                  </p>
                  <p className="text-gray-600">
                    Tramos:{' '}
                    <span className="font-medium">
                      {planSeleccionado.tramos.length} configurados
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Vigencia Inicio *</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Vigencia Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Resumen y confirmación */}
          {paso === 3 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-bold text-blue-800">Resumen de Asignación</p>
                <p className="text-sm text-blue-700">
                  Asignarás el plan{' '}
                  <span className="font-semibold">&quot;{planSeleccionado?.nombre}&quot;</span> a{' '}
                  <span className="font-semibold">{selectedVendedores.length} vendedor(es)</span>
                  {fechaInicio && (
                    <>
                      , vigente desde el <span className="font-semibold">{fechaInicio}</span>
                    </>
                  )}
                  {fechaFin && (
                    <>
                      {' '}
                      hasta el <span className="font-semibold">{fechaFin}</span>
                    </>
                  )}
                  {!fechaFin && ' de forma indefinida'}.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Vendedores
                </p>
                <div className="space-y-2">
                  {nombresSeleccionados.map((v) => (
                    <div key={v.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {v.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{v.nombre}</p>
                        <p className="text-xs text-gray-500">{v.equipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <div className="border-t px-6 py-4 shrink-0 flex justify-between items-center bg-gray-50">
          {paso > 1 ? (
            <Button variant="outline" onClick={() => setPaso((p) => (p - 1) as 1 | 2 | 3)}>
              <ChevronLeft size={16} className="mr-1" /> Atrás
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {paso < 3 ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={paso === 1 ? !puedeAvanzarPaso1 : !puedeAvanzarPaso2}
              onClick={() => setPaso((p) => (p + 1) as 1 | 2 | 3)}
            >
              Siguiente <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirmar}
              disabled={guardando}
            >
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
        </div>
      </div>
    </>
  );
};
