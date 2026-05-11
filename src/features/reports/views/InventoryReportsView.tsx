'use client';

import React, { useState } from 'react';
import { endpoints } from 'src/lib/axios';
import { downloadExport } from 'src/lib/export-service';
import { cn } from 'src/lib/utils';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button, Icon } from 'src/shared/components/ui';
import type { IconName } from 'src/shared/components/ui/icon';

import { AreaChart, BarChart, DonutChart, LineChart } from '../components/charts/ReportCharts';
import { ExportBar } from '../components/ExportBar';
import { ReportFilters } from '../components/ReportFilters';
import { ReportTable } from '../components/tables/ReportTable';
import { useInventoryReport } from '../hooks/use-reports';
import type { InventoryReport, InventoryReportTab, ReportFilterParams } from '../types';

function getKpiMeta(key: string): { icon: IconName; iconBg: string; iconColor: string } {
  const k = key.toLowerCase();
  if (
    k.includes('agotado') ||
    k.includes('riesgo') ||
    k.includes('descuadre') ||
    k.includes('crítico')
  )
    return { icon: 'AlertTriangle', iconBg: 'bg-red-100', iconColor: 'text-red-600' };
  if (k.includes('bodega') || k.includes('bodeg'))
    return { icon: 'Warehouse', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
  if (k.includes('tienda'))
    return { icon: 'Store', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' };
  if (k.includes('movimiento') || k.includes('traslado'))
    return { icon: 'ArrowLeftRight', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' };
  if (k.includes('entrada'))
    return { icon: 'PackagePlus', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' };
  if (k.includes('ajuste'))
    return { icon: 'SlidersHorizontal', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' };
  if (k.includes('categoría') || k.includes('catálogo'))
    return { icon: 'Layers', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' };
  if (k.includes('reserva') || k.includes('separad'))
    return { icon: 'CalendarDays', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' };
  if (k.includes('cliente'))
    return { icon: 'Users', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' };
  if (k.includes('stock') || k.includes('bajo'))
    return { icon: 'Package', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' };
  if (k.includes('unidad') || k.includes('global'))
    return { icon: 'BarChart3', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
  return { icon: 'BarChart2', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
}

const TABS: { id: InventoryReportTab; label: string }[] = [
  { id: 'warehouse', label: 'Stock por bodega' },
  { id: 'risk', label: 'Productos en riesgo' },
  { id: 'movements', label: 'Movimientos' },
  { id: 'category', label: 'Resumen por categoría' },
  { id: 'b2b', label: 'Reservas B2B' },
];

export function InventoryReportsView() {
  const [activeTab, setActiveTab] = useState<InventoryReportTab>('warehouse');
  const [filters, setFilters] = useState<ReportFilterParams>({ period: 'Este mes' });
  const [search, setSearch] = useState('');
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

  const { data: reportData, isLoading } = useInventoryReport(activeTab, {
    ...filters,
    ...(search ? { search } : {}),
  });

  const doExport = async (type: 'excel' | 'pdf', fields: string[]) => {
    setExportLoading(type);
    try {
      await downloadExport({
        endpoint: endpoints.reports.inventoryExport,
        format: type,
        fields,
        tab: activeTab,
        filters,
        filename: `reporte-inventario-${activeTab}.${type === 'excel' ? 'xlsx' : 'pdf'}`,
      });
    } finally {
      setExportLoading(null);
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[300px] bg-muted rounded-xl" />
            <div className="h-[300px] bg-muted rounded-xl" />
          </div>
          <div className="h-[200px] bg-muted rounded-xl w-full" />
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-muted-foreground/40" />
          <p className="text-body2 font-semibold">No se pudieron cargar los datos del reporte</p>
          <p className="text-caption mt-1">Verificá tu conexión o intentá más tarde</p>
        </div>
      );
    }

    // Defensive: unwrap if backend returns { success, data } wrapper
    const safeData =
      ((reportData as unknown as Record<string, unknown>)?.data as InventoryReport | undefined) ??
      reportData;
    const { kpis = {}, chart_data, table_data = [], most_critical } = safeData;
    const chartData = chart_data ?? { series: [], categories: [], labels: [] };

    const namedSeries =
      Array.isArray(chartData.series) &&
      chartData.series.length > 0 &&
      typeof chartData.series[0] === 'object'
        ? (chartData.series as { name: string; data: number[] }[])
        : [{ name: 'Valor', data: chartData.series as number[] }];

    const flatSeries: number[] =
      Array.isArray(chartData.series) &&
      chartData.series.length > 0 &&
      typeof chartData.series[0] === 'number'
        ? (chartData.series as number[])
        : [];

    const columns =
      table_data.length > 0
        ? Object.keys(table_data[0])
            .filter((k) => !k.includes('id') && k !== 'items')
            .map((k) => ({
              id: k,
              label: k === 'statusBadge' ? 'Estado' : k.charAt(0).toUpperCase() + k.slice(1),
            }))
        : [];

    return (
      <div className="w-full max-w-full space-y-6">
        {/* KPIs */}
        <div className="flex flex-wrap gap-4 pb-2">
          {Object.entries(kpis).map(([key, val]) => {
            const meta = getKpiMeta(key);
            const isNegative =
              key.toLowerCase().includes('agotado') ||
              key.toLowerCase().includes('crítico') ||
              key.toLowerCase().includes('descuadre') ||
              (typeof val === 'number' && val > 0 && key.toLowerCase().includes('riesgo'));
            return (
              <SectionCard key={key} className="min-w-[140px] sm:min-w-[180px] flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-2 rounded-xl', meta.iconBg)}>
                    <Icon name={meta.icon} size={15} className={meta.iconColor} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      isNegative ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    )}
                  >
                    {isNegative ? '↓' : '↑'}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-2xl font-extrabold tracking-tight tabular-nums mb-1',
                    isNegative ? 'text-error' : 'text-foreground'
                  )}
                >
                  {String(val)}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                  {key}
                </p>
              </SectionCard>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard className="pt-5 pb-2 px-3 sm:px-5 overflow-hidden flex flex-col w-full h-[360px]">
            <h3 className="text-subtitle2 font-bold mb-4 px-2">Comportamiento analítico</h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center -ml-2 sm:-ml-0">
              {activeTab === 'risk' ? (
                <DonutChart labels={chartData.labels ?? []} series={flatSeries} />
              ) : activeTab === 'movements' ? (
                <LineChart categories={chartData.categories ?? []} series={namedSeries} />
              ) : (
                <BarChart
                  categories={chartData.categories ?? []}
                  series={namedSeries}
                  horizontal={activeTab === 'b2b'}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard className="pt-5 pb-2 px-3 sm:px-5 overflow-hidden flex flex-col w-full h-[360px]">
            <h3 className="text-subtitle2 font-bold mb-4 px-2">
              {activeTab === 'risk' ? 'Producto más crítico' : 'Vista de áreas / Comparativa'}
            </h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center">
              {activeTab === 'risk' && most_critical ? (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-error/10 border border-error/20 rounded-xl w-full h-full">
                  <Icon name="AlertTriangle" size={48} className="text-error mb-4" />
                  <p className="text-body2 text-muted-foreground">{most_critical.sku}</p>
                  <p className="text-subtitle1 font-bold text-foreground mb-4">
                    {most_critical.name}
                  </p>
                  <p className="text-4xl font-black text-error mb-2">{most_critical.available}</p>
                  <p className="text-caption text-muted-foreground mb-4">
                    Stock disponible frente a {most_critical.min_stock} min.
                  </p>
                  <Button variant="outline" size="sm" color="error">
                    Ver en inventario
                  </Button>
                </div>
              ) : activeTab === 'category' || activeTab === 'b2b' ? (
                <AreaChart categories={chartData.categories ?? []} series={namedSeries} />
              ) : (
                <BarChart
                  categories={chartData.categories ?? []}
                  series={namedSeries}
                  stacked={true}
                />
              )}
            </div>
          </SectionCard>
        </div>

        {/* Table */}
        <div className="w-full">
          <ReportTable
            columns={columns}
            data={table_data}
            search={search}
            onSearchChange={setSearch}
          />
        </div>
      </div>
    );
  };

  const columnsContext =
    reportData?.table_data && reportData.table_data.length > 0
      ? Object.keys(reportData.table_data[0])
          .filter((k) => !k.includes('id') && k !== 'items')
          .map((k) => ({
            id: k,
            label: k === 'statusBadge' ? 'Estado' : k.charAt(0).toUpperCase() + k.slice(1),
          }))
      : [];

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reportes de Inventario"
        subtitle="Analiza y centraliza la información de los diferentes rubros de tu inventario"
      />

      <div className="w-full mb-6">
        <ReportFilters onFiltersChange={setFilters} />
      </div>

      <div className="flex-none border-b border-border/60 overflow-x-auto w-full mb-6">
        <div className="flex gap-6 min-w-max px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ExportBar
        columns={columnsContext}
        hasData={!!reportData && reportData.table_data.length > 0}
        loading={exportLoading}
        onExportExcel={(fields) => doExport('excel', fields)}
        onExportPdf={(fields) => doExport('pdf', fields)}
      />

      <div className="w-full relative pb-4">{renderTabContent()}</div>
    </PageContainer>
  );
}
