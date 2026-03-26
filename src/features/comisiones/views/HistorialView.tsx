'use client';

import React, { useState } from 'react';
import { useHistorial } from 'src/features/comisiones/hooks/use-historial';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { FileDown, Search, ChevronDown, ChevronUp, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Mock detail data por registro
const MOCK_DETALLES: Record<
  string,
  {
    ventas: { fecha: string; cliente: string; monto: number }[];
    desglose: {
      tramo: string;
      rango: string;
      porcentaje: number;
      monto: number;
      comision: number;
    }[];
    timeline: { accion: string; actor: string; fecha: string }[];
  }
> = {
  'reg-1': {
    ventas: [
      { fecha: '10/02/2025', cliente: 'Distribuidora Alfa', monto: 5000 },
      { fecha: '22/02/2025', cliente: 'Comercial Beta S.A.', monto: 3040 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 3040, comision: 152 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/03/2025' },
      { accion: 'Pendiente de aprobación', actor: 'Sistema', fecha: '01/03/2025' },
    ],
  },
  'reg-2': {
    ventas: [
      { fecha: '05/02/2025', cliente: 'TechCorp Ltda.', monto: 10000 },
      { fecha: '18/02/2025', cliente: 'Soluciones Gamma', monto: 2500 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 5000, comision: 250 },
      { tramo: 'Tramo 3', rango: '$10,001+', porcentaje: 8, monto: 2500, comision: 200 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/03/2025' },
      { accion: 'Aprobado', actor: 'Admin RH', fecha: '05/03/2025' },
    ],
  },
  'reg-3': {
    ventas: [
      { fecha: '12/01/2025', cliente: 'Grupo Delta', monto: 5000 },
      { fecha: '25/01/2025', cliente: 'Empresa Epsilon', monto: 4200 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 4200, comision: 210 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/02/2025' },
      { accion: 'Aprobado', actor: 'Admin RH', fecha: '03/02/2025' },
      { accion: 'Pagado', actor: 'Admin RH', fecha: '15/02/2025' },
    ],
  },
};

export const HistorialView = () => {
  const { registros, isLoading, cambiarEstado } = useHistorial();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mini-modal PDF
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfGenerando, setPdfGenerando] = useState(false);
  const [pdfOpciones, setPdfOpciones] = useState({
    detalleVentas: true,
    desgloseTramos: true,
    resumenEjecutivo: false,
  });

  const handleSelectAll = () => {
    if (selectedIds.length === registros.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registros.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleGenerarPDF = async () => {
    setPdfGenerando(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPdfGenerando(false);
    setPdfModalOpen(false);
    toast.success('Reporte listo. [Descargar PDF]');
  };

  const pendientes = registros.filter((r) => r.estado === 'PENDIENTE');
  const sumaPendientes = pendientes.reduce((acc, r) => acc + r.comisionCalculada, 0);
  const aprobados = registros.filter((r) => r.estado === 'APROBADO');
  const sumaAprobados = aprobados.reduce((acc, r) => acc + r.comisionCalculada, 0);
  const pagados = registros.filter((r) => r.estado === 'PAGADO');
  const sumaPagados = pagados.reduce((acc, r) => acc + r.comisionCalculada, 0);

  const seleccionPendientes = selectedIds.filter((id) => pendientes.find((r) => r.id === id));
  const seleccionAprobados = selectedIds.filter((id) => aprobados.find((r) => r.id === id));

  return (
    <PageContainer fluid className="pb-20 min-w-0 w-full space-y-6">
      <PageHeader
        title="Historial y Liquidación"
        subtitle="Revisa el historial de comisiones y gestiona el proceso de aprobación y pago"
        action={
          <Button
            onClick={() => setPdfModalOpen(true)}
            variant="outline"
            className="border-gray-300"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generar Reporte PDF
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5 flex justify-between items-center border-l-4 border-l-yellow-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Pendientes</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              ${sumaPendientes.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-50 text-yellow-600 px-3 py-1 text-sm rounded-full font-bold">
            {pendientes.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5 flex justify-between items-center border-l-4 border-l-green-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Aprobadas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              ${sumaAprobados.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 text-green-600 px-3 py-1 text-sm rounded-full font-bold">
            {aprobados.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5 flex justify-between items-center border-l-4 border-l-blue-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Pagadas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">${sumaPagados.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 text-sm rounded-full font-bold">
            {pagados.length}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            placeholder="Buscar vendedor..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md"
          />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm bg-white min-w-[150px]">
          <option>Todos los periodos</option>
          <option>Febrero 2025</option>
          <option>Enero 2025</option>
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-white min-w-[150px]">
          <option>Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="PAGADO">Pagado</option>
        </select>
        <Button variant="ghost" size="sm" className="text-gray-500">
          Limpiar Filtros
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === registros.length}
                    />
                  </th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">Ventas</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3 text-right">Comisión</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((reg) => {
                  const isExpanded = expandedId === reg.id;
                  const detalle = MOCK_DETALLES[reg.id];

                  return (
                    <React.Fragment key={reg.id}>
                      <tr
                        className={`border-b hover:bg-gray-50 ${isExpanded ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(reg.id)}
                            onChange={() => toggleSelect(reg.id)}
                          />
                        </td>
                        <td className="px-4 py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {reg.vendedorNombre.charAt(0)}
                            </div>
                            {reg.vendedorNombre}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500">{reg.periodo}</td>
                        <td className="px-4 py-4">${reg.ventasPeriodo.toLocaleString()}</td>
                        <td className="px-4 py-4 text-gray-500">{reg.planAplicado}</td>
                        <td className="px-4 py-4 font-bold text-right text-gray-900">
                          ${reg.comisionCalculada.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          {reg.estado === 'PENDIENTE' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              Pendiente
                            </span>
                          )}
                          {reg.estado === 'APROBADO' && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              Aprobado
                            </span>
                          )}
                          {reg.estado === 'PAGADO' && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              Pagado
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleExpand(reg.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Fila expandible */}
                      {isExpanded && detalle && (
                        <tr>
                          <td colSpan={8} className="bg-slate-50 border-b px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Ventas del periodo */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                                  Ventas del Periodo
                                </h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-400">
                                      <th className="text-left pb-1">Fecha</th>
                                      <th className="text-left pb-1">Cliente</th>
                                      <th className="text-right pb-1">Monto</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalle.ventas.map((v, i) => (
                                      <tr key={i} className="border-t border-gray-200">
                                        <td className="py-1.5 text-gray-500">{v.fecha}</td>
                                        <td className="py-1.5 font-medium text-gray-700">
                                          {v.cliente}
                                        </td>
                                        <td className="py-1.5 text-right font-semibold">
                                          ${v.monto.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Desglose por tramos */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                                  Desglose por Tramos
                                </h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-400">
                                      <th className="text-left pb-1">Tramo</th>
                                      <th className="text-center pb-1">%</th>
                                      <th className="text-right pb-1">Comisión</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalle.desglose.map((d, i) => (
                                      <tr key={i} className="border-t border-gray-200">
                                        <td className="py-1.5">
                                          <div className="font-medium text-gray-700">{d.tramo}</div>
                                          <div className="text-gray-400">{d.rango}</div>
                                        </td>
                                        <td className="py-1.5 text-center text-gray-600">
                                          {d.porcentaje}%
                                        </td>
                                        <td className="py-1.5 text-right font-bold text-blue-600">
                                          ${d.comision.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="border-t-2 border-blue-200 bg-blue-50/50">
                                      <td
                                        colSpan={2}
                                        className="py-1.5 font-bold text-gray-700 text-right pr-2"
                                      >
                                        Total
                                      </td>
                                      <td className="py-1.5 text-right font-bold text-blue-700">
                                        ${reg.comisionCalculada.toLocaleString()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Timeline de estados */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                                  Historial de Estados
                                </h4>
                                <div className="space-y-3">
                                  {detalle.timeline.map((t, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
                                            i === detalle.timeline.length - 1
                                              ? 'bg-blue-500'
                                              : 'bg-gray-300'
                                          }`}
                                        />
                                        {i < detalle.timeline.length - 1 && (
                                          <div className="w-px bg-gray-200 mt-1 min-h-[16px] flex-1" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700">
                                          {t.accion}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {t.actor} · {t.fecha}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Barra flotante selección */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5 z-[50]">
          <span className="font-medium text-sm">
            {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'registro seleccionado' : 'registros seleccionados'}
          </span>
          <div className="flex gap-2 border-l border-gray-700 pl-6">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={seleccionPendientes.length === 0}
              onClick={() => cambiarEstado(seleccionPendientes, 'APROBADO')}
            >
              Aprobar ({seleccionPendientes.length})
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              disabled={seleccionAprobados.length === 0}
              onClick={() => cambiarEstado(seleccionAprobados, 'PAGADO')}
            >
              Marcar Pagados ({seleccionAprobados.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedIds([])}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Mini-modal PDF (mock) */}
      {pdfModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => !pdfGenerando && setPdfModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white rounded-xl shadow-2xl w-[300px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-800">Generar Reporte PDF</h3>
              </div>
              {!pdfGenerando && (
                <button
                  onClick={() => setPdfModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Periodo</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option>Febrero 2025</option>
                  <option>Enero 2025</option>
                  <option>Todos los periodos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Incluir</label>
                {[
                  { key: 'detalleVentas', label: 'Detalle de ventas' },
                  { key: 'desgloseTramos', label: 'Desglose por tramos' },
                  { key: 'resumenEjecutivo', label: 'Resumen ejecutivo' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pdfOpciones[key as keyof typeof pdfOpciones]}
                      onChange={(e) =>
                        setPdfOpciones((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleGenerarPDF}
                disabled={pdfGenerando}
              >
                {pdfGenerando ? (
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
                    Generando documento...
                  </span>
                ) : (
                  'Generar PDF'
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};
