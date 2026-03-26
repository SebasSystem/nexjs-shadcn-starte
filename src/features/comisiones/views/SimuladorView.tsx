'use client';

import React, { useState } from 'react';
import { useSimulador } from 'src/features/comisiones/hooks/use-simulador';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Calculator, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export const SimuladorView = () => {
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);

  const {
    plan,
    ventasAcumuladas,
    setVentasAcumuladas,
    ventaHipotetica,
    setVentaHipotetica,
    desglose,
    totalComisionHipotetica,
    tramoActual,
    resetForm,
  } = useSimulador();

  // Calcular cuánto falta para el siguiente tramo
  const siguienteTramo = (() => {
    if (!tramoActual || tramoActual.hasta === null) return null;
    const tramosOrdenados = [...plan.tramos].sort((a, b) => a.desde - b.desde);
    const idxActual = tramosOrdenados.findIndex((t) => t.id === tramoActual.id);
    if (idxActual === -1 || idxActual >= tramosOrdenados.length - 1) return null;
    const siguiente = tramosOrdenados[idxActual + 1];
    const falta = tramoActual.hasta + 1 - ventasAcumuladas;
    return { tramo: siguiente, faltaMonto: Math.max(0, falta), numero: idxActual + 2 };
  })();

  const mostrarDesglose = ventaHipotetica > 0 || ventasAcumuladas > 0;

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Simulador de Comisión"
        subtitle="Ingresa un monto de venta hipotético y mira cómo se calcula tu comisión según tu plan actual"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Panel Izquierdo: Formulario */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calculator size={18} className="text-blue-600" /> Parámetros de Simulación
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ventas acumuladas en el periodo
                <p className="text-xs font-normal text-gray-500 mt-1 mb-2">
                  Ingresa las ventas ya realizadas en el mes actual
                </p>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  value={ventasAcumuladas || ''}
                  onChange={(e) => setVentasAcumuladas(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full h-11 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg transition-shadow"
                />
              </div>
              {/* Indicador de tramo actual — feedback inmediato */}
              {tramoActual && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
                  <span className="text-indigo-500 font-bold">📍</span>
                  <span className="text-indigo-700 font-medium">
                    Estás en Tramo {tramoActual.numero} — {tramoActual.porcentajeAplicado}% de
                    comisión
                  </span>
                  <span className="text-indigo-500 text-xs ml-auto">
                    ${tramoActual.desde.toLocaleString()} –{' '}
                    {tramoActual.hasta ? '$' + tramoActual.hasta.toLocaleString() : '∞'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-bold text-blue-900">
                Venta hipotética a simular
                <p className="text-xs font-normal text-blue-700/70 mt-1 mb-2">
                  ¿Cuánto más esperas vender?
                </p>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-blue-600 font-bold">$</span>
                <input
                  type="number"
                  value={ventaHipotetica || ''}
                  onChange={(e) => setVentaHipotetica(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full h-12 pl-8 pr-3 border-2 border-blue-300 bg-blue-50 rounded-lg text-xl font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={resetForm}
            className="mt-2 w-full md:w-auto self-start border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} className="mr-2" />
            Nueva Simulación
          </Button>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg border text-sm">
            <p className="font-semibold text-gray-700 mb-1">
              📋 Plan aplicado: &quot;{plan.nombre}&quot;
            </p>
            <p className="text-gray-500">Tipo: {plan.tipo === 'VENTA' ? 'Por Venta' : plan.tipo}</p>
            <p className="text-gray-500">
              Base: {plan.porcentajeBase}% | Tramos: {plan.tramos.length} configurados
            </p>
            <a
              href="/rh/comisiones/planes"
              className="text-blue-600 text-xs font-medium mt-2 inline-block hover:underline"
            >
              Ver detalle del plan →
            </a>
          </div>
        </div>

        {/* Panel Derecho: Resultados */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Comisión Total Proyectada
            </h3>
            <div className="text-5xl font-extrabold text-blue-600 tracking-tight">
              ${totalComisionHipotetica.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-4 font-medium">
              Sobre la venta hipotética de ${ventaHipotetica.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800">Desglose por Tramos</h3>
            </div>

            {mostrarDesglose ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tramo / Rango</th>
                    <th className="px-6 py-3 font-medium text-center">% Aplicado</th>
                    <th className="px-6 py-3 font-medium text-right">Monto en Tramo</th>
                    <th className="px-6 py-3 font-bold text-right text-blue-600">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {desglose.map((t, index) => {
                    const aplica = t.montoQueEntraEnTramo > 0;
                    return (
                      <tr
                        key={index}
                        className={`border-b last:border-0 ${aplica ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}
                      >
                        <td className="px-6 py-3">
                          <div
                            className={`font-medium ${aplica ? 'text-gray-900' : 'text-gray-500'}`}
                          >
                            {t.tramoInfo}
                          </div>
                          <div className="text-xs text-gray-500">{t.rangoTxt}</div>
                        </td>
                        <td className="px-6 py-3 text-center font-medium text-gray-600">
                          {t.porcentaje}%
                        </td>
                        <td className="px-6 py-3 text-right text-gray-600">
                          ${t.montoQueEntraEnTramo.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-blue-600">
                          ${t.comisionGenerada.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-blue-50/50 border-t-2 border-blue-100">
                    <td colSpan={2} className="px-6 py-4 font-bold text-gray-800 text-right">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                      ${ventaHipotetica.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                      ${totalComisionHipotetica.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Calculator size={32} className="text-gray-300 mb-3" />
                <p className="text-gray-500">Ingresa un monto para ver la simulación de tramos.</p>
              </div>
            )}
          </div>

          {/* Acordeón: ¿Cuánto más necesito para subir de tramo? */}
          {siguienteTramo && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                onClick={() => setAcordeonAbierto(!acordeonAbierto)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Lightbulb size={16} className="text-yellow-500" />
                  ¿Cuánto más necesito para subir de tramo?
                </span>
                {acordeonAbierto ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {acordeonAbierto && (
                <div className="px-6 pb-5 space-y-4 border-t bg-yellow-50/40">
                  <p className="text-sm text-gray-700 pt-4">
                    Te faltan{' '}
                    <span className="font-bold text-yellow-700">
                      ${siguienteTramo.faltaMonto.toLocaleString()}
                    </span>{' '}
                    para entrar al <span className="font-bold">Tramo {siguienteTramo.numero}</span>{' '}
                    con{' '}
                    <span className="font-bold text-green-700">
                      {siguienteTramo.tramo.porcentajeAplicado}%
                    </span>{' '}
                    de comisión.
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progreso hacia el siguiente tramo</span>
                      <span className="font-medium">
                        ${ventasAcumuladas.toLocaleString()} / $
                        {siguienteTramo.tramo.desde.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (ventasAcumuladas / siguienteTramo.tramo.desde) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 bg-white border rounded-lg px-3 py-2">
                    Si vendes{' '}
                    <span className="font-semibold">
                      ${siguienteTramo.faltaMonto.toLocaleString()}
                    </span>{' '}
                    más, tu tasa sube al{' '}
                    <span className="font-semibold text-green-700">
                      {siguienteTramo.tramo.porcentajeAplicado}%
                    </span>{' '}
                    — eso significa{' '}
                    <span className="font-bold text-blue-700">
                      +$
                      {(
                        siguienteTramo.faltaMonto *
                        (siguienteTramo.tramo.porcentajeAplicado / 100)
                      ).toFixed(2)}
                    </span>{' '}
                    de comisión adicional por cada peso nuevo en ese tramo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
