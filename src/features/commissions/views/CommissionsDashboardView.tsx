'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import type { VentaReciente } from 'src/features/commissions/hooks/use-dashboard';
import { useDashboardCommissions } from 'src/features/commissions/hooks/use-dashboard';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Icon } from 'src/shared/components/ui/icon';

type VentaPeriodo = VentaReciente;
const columnHelper = createColumnHelper<VentaPeriodo>();

export const CommissionsDashboardView = () => {
  const { kpis, tiersProgress, recentSales, isLoading } = useDashboardCommissions();

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Fecha',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('client', {
        header: 'Cliente',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('amount', {
        header: 'Monto Venta',
        cell: (info) => (
          <div className="text-right font-medium text-foreground">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('commission_generated', {
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
    data: recentSales,
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

  const porcentajeMeta = Math.min(
    Math.round((kpis.achieved_sales / kpis.monthly_target) * 100),
    100
  );

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
            <Icon name="Target" className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold">${kpis.monthly_target.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-2">Periodo actual</div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ventas Logradas
            </span>
            <Icon name="TrendingUp" className="text-green-500" size={20} />
          </div>
          <div
            className={`text-3xl font-bold ${porcentajeMeta >= 50 ? 'text-green-600' : 'text-foreground'}`}
          >
            ${kpis.achieved_sales.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            {porcentajeMeta}% de la meta
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${porcentajeMeta}%` }}
            />
          </div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Comisión Proyectada
            </span>
            <Icon name="DollarSign" className="text-yellow-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600 h-[36px]">
            ${kpis.projected_commission.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Basado en ventas actuales</div>
        </SectionCard>

        <SectionCard className="hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Liquidado
            </span>
            <Icon name="CheckCircle2" className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-700 h-[36px]">
            ${kpis.liquidated_commission.toLocaleString()}
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
            ${kpis.achieved_sales.toLocaleString()} / ${kpis.monthly_target.toLocaleString()}
          </p>
        </SectionCard>

        {/* Detalle de Tramos Activos */}
        <SectionCard>
          <h3 className="text-h6 text-foreground mb-6">Tramos de tu plan actual</h3>
          <div className="space-y-6">
            {tiersProgress.map((tier) => (
              <div key={tier.uid} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      tier.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : tier.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tier.name} • {tier.percent}%
                  </span>
                  <span className="text-muted-foreground text-xs">{tier.range_text}</span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      tier.status === 'COMPLETED'
                        ? 'bg-green-500'
                        : tier.status === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-transparent'
                    }`}
                    style={{ width: `${tier.completed}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {tier.status === 'IN_PROGRESS'
                      ? `$${tier.amount_achieved.toLocaleString()} de $${tier.amount_target.toLocaleString()}`
                      : tier.status === 'PENDING'
                        ? 'Por desbloquear'
                        : 'Completado'}
                  </span>
                  <span className="font-semibold">{tier.completed}%</span>
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
