'use client';

import React from 'react';
import { useDashboardComisiones } from 'src/features/comisiones/hooks/use-dashboard';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Target, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

export const DashboardComisionesView = () => {
  const { kpis, tramos, ventas, isLoading } = useDashboardComisiones();

  if (isLoading || !kpis) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-100 w-1/3 rounded-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="h-80 bg-gray-100 rounded-xl" />
          <div className="h-80 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const porcentajeMeta = Math.min(Math.round((kpis.ventasLogradas / kpis.metaMensual) * 100), 100);

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Mi Dashboard de Comisiones"
        subtitle="Revisa tu progreso y proyección de comisiones de este periodo"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Meta Mensual
            </span>
            <Target className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold">${kpis.metaMensual.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">Periodo actual</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ventas Logradas
            </span>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div
            className={`text-3xl font-bold ${porcentajeMeta >= 50 ? 'text-green-600' : 'text-gray-900'}`}
          >
            ${kpis.ventasLogradas.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-medium">{porcentajeMeta}% de la meta</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${porcentajeMeta}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Comisión Proyectada
            </span>
            <DollarSign className="text-yellow-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600 h-[36px]">
            ${kpis.comisionProyectada.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2">Basado en ventas actuales</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Liquidado
            </span>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-700 h-[36px]">
            ${kpis.comisionLiquidada.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2">Periodos anteriores</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Gráfico de Progreso - Simulado con anillo CSS */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-gray-700 w-full mb-6">Progreso Mensual</h3>
          <div className="relative w-48 h-48 flex items-center justify-center -mt-4">
            <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
              <path
                className="text-gray-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 transition-all duration-1000"
                strokeDasharray={`${porcentajeMeta}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{porcentajeMeta}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">de la meta</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            ${kpis.ventasLogradas.toLocaleString()} / ${kpis.metaMensual.toLocaleString()}
          </p>
        </div>

        {/* Detalle de Tramos Activos */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6">Tramos de tu plan actual</h3>
          <div className="space-y-6">
            {tramos.map((tramo) => (
              <div key={tramo.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      tramo.estado === 'COMPLETADO'
                        ? 'bg-green-100 text-green-800'
                        : tramo.estado === 'EN_PROGRESO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tramo.nombre} • {tramo.porcentaje}%
                  </span>
                  <span className="text-gray-500 text-xs">{tramo.rangoTxt}</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      tramo.estado === 'COMPLETADO'
                        ? 'bg-green-500'
                        : tramo.estado === 'EN_PROGRESO'
                          ? 'bg-blue-500'
                          : 'bg-transparent'
                    }`}
                    style={{ width: `${tramo.completado}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {tramo.estado === 'EN_PROGRESO'
                      ? `$${tramo.montoLogrado.toLocaleString()} de $${tramo.montoMeta.toLocaleString()}`
                      : tramo.estado === 'PENDIENTE'
                        ? 'Por desbloquear'
                        : 'Completado'}
                  </span>
                  <span className="font-semibold">{tramo.completado}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-2">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700">Últimas Ventas del Periodo</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-white border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Fecha</th>
              <th className="px-6 py-3 font-medium">Cliente</th>
              <th className="px-6 py-3 font-medium text-right">Monto Venta</th>
              <th className="px-6 py-3 font-medium text-right">Comisión Gen.</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500">{venta.fecha}</td>
                <td className="px-6 py-3 font-medium text-gray-800">{venta.cliente}</td>
                <td className="px-6 py-3 text-right font-medium text-gray-900">
                  ${venta.monto.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right font-bold text-blue-600">
                  ${venta.comisionGenerada.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};
