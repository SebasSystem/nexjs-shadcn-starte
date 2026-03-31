'use client';

import React, { useMemo } from 'react';
import { useDashboardCommissions } from 'src/features/commissions/hooks/use-dashboard';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Target, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

type VentaPeriodo = {
  id: string;
  fecha: string;
  cliente: string;
  monto: number;
  comisionGenerada: number;
};

const columnHelper = createColumnHelper<VentaPeriodo>();

export const CommissionsDashboardView = () => {
  const { kpis, tramos, ventas, isLoading } = useDashboardCommissions();

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('fecha', {
        header: 'Fecha',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('cliente', {
        header: 'Cliente',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('monto', {
        header: 'Monto Venta',
        cell: (info) => (
          <div className="text-right font-medium text-foreground">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('comisionGenerada', {
        header: 'Comisión Gen.',
        cell: (info) => (
          <div className="text-right font-bold text-blue-600">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: ventas,
    columns: COLUMNS,
    defaultRowsPerPage: 5,
  });

  if (isLoading || !kpis) {
    return (
      <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
        <PageHeader
          title="Mi Dashboard de Comisiones"
          subtitle="Revisa tu progreso y proyección de comisiones de este periodo"
        />
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SectionCard key={i} className="h-32 bg-muted/60">
                <div />
              </SectionCard>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <SectionCard className="h-80 bg-muted/60">
              <div />
            </SectionCard>
            <SectionCard className="h-80 bg-muted/60">
              <div />
            </SectionCard>
          </div>
        </div>
      </PageContainer>
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
        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Meta Mensual
            </span>
            <Target className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold">${kpis.metaMensual.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-2">Periodo actual</div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ventas Logradas
            </span>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div
            className={`text-3xl font-bold ${porcentajeMeta >= 50 ? 'text-green-600' : 'text-foreground'}`}
          >
            ${kpis.ventasLogradas.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            {porcentajeMeta}% de la meta
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${porcentajeMeta}%` }}
            ></div>
          </div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Comisión Proyectada
            </span>
            <DollarSign className="text-yellow-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600 h-[36px]">
            ${kpis.comisionProyectada.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Basado en ventas actuales</div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Liquidado
            </span>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-700 h-[36px]">
            ${kpis.comisionLiquidada.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Periodos anteriores</div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Gráfico de Progreso - Simulado con anillo CSS */}
        <SectionCard className="flex flex-col items-center justify-center">
          <h3 className="text-h6 text-foreground w-full mb-8">Progreso Mensual</h3>
          <div className="relative w-48 h-48 flex items-center justify-center -mt-4">
            <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
              <path
                className="text-muted/40"
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
              <span className="text-4xl font-bold text-foreground">{porcentajeMeta}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                de la meta
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            ${kpis.ventasLogradas.toLocaleString()} / ${kpis.metaMensual.toLocaleString()}
          </p>
        </SectionCard>

        {/* Detalle de Tramos Activos */}
        <SectionCard>
          <h3 className="text-h6 text-foreground mb-6">Tramos de tu plan actual</h3>
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
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tramo.nombre} • {tramo.porcentaje}%
                  </span>
                  <span className="text-muted-foreground text-xs">{tramo.rangoTxt}</span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
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

                <div className="flex justify-between items-center text-xs text-muted-foreground">
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
        </SectionCard>
      </div>

      <SectionCard noPadding className="mt-2">
        <div className="px-6 py-4 flex justify-between items-center bg-muted/20">
          <h3 className="text-h6 text-foreground">Últimas Ventas del Periodo</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>
    </PageContainer>
  );
};
