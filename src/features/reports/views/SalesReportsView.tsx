'use client';

import React, { useState } from 'react';
import { endpoints } from 'src/lib/axios';
import { downloadExport } from 'src/lib/export-service';
import { cn } from 'src/lib/utils';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Icon } from 'src/shared/components/ui';
import type { IconName } from 'src/shared/components/ui/icon';

import { AreaChart, BarChart, DonutChart, LineChart } from '../components/charts/ReportCharts';
import { ExportBar } from '../components/ExportBar';
import { ReportFilters } from '../components/ReportFilters';
import { ReportTable } from '../components/tables/ReportTable';
import { useSalesReport } from '../hooks/use-reports';
import type { ReportFilterParams, SalesReportTab } from '../types';

function getKpiMeta(key: string): { icon: IconName; iconBg: string; iconColor: string } {
  const k = key.toLowerCase();
  if (k.includes('rechazad') || k.includes('aire') || k.includes('pendiente'))
    return { icon: 'AlertTriangle', iconBg: 'bg-red-100', iconColor: 'text-red-600' };
  if (k.includes('aprobad') || k.includes('cierre') || k.includes('cerrad'))
    return { icon: 'CheckCircle', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' };
  if (k.includes('total') || k.includes('generada'))
    return { icon: 'FileText', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
  if (k.includes('estrella') || k.includes('líder') || k.includes('top'))
    return { icon: 'TrendingUp', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' };
  if (k.includes('producto') || k.includes('sku') || k.includes('variedad'))
    return { icon: 'Package', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' };
  if (k.includes('tasa') || k.includes('conversión') || k.includes('promedio'))
    return { icon: 'TrendingUp', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' };
  if (k.includes('cliente') || k.includes('distribuidor'))
    return { icon: 'Users', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' };
  if (k.includes('oportunidad'))
    return { icon: 'Briefcase', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' };
  return { icon: 'BarChart2', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
}

const TABS: { id: SalesReportTab; label: string }[] = [
  { id: 'status', label: 'Estatus cotizaciones' },
  { id: 'products', label: 'Productos Top' },
  { id: 'distributors', label: 'Rendimiento clientes' },
  { id: 'vs', label: 'Evolución conversiones' },
];

export function SalesReportsView() {
  const [activeTab, setActiveTab] = useState<SalesReportTab>('status');
  const [filters, setFilters] = useState<ReportFilterParams>({ period: 'Este mes' });
  const [search, setSearch] = useState('');
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

  const { data: reportData, isLoading } = useSalesReport(activeTab, {
    ...filters,
    ...(search ? { search } : {}),
  });

  const doExport = async (type: 'excel' | 'pdf', fields: string[]) => {
    setExportLoading(type);
    try {
      await downloadExport({
        endpoint: endpoints.reports.salesExport,
        format: type,
        fields,
        tab: activeTab,
        filters,
        filename: `reporte-ventas-${activeTab}.${type === 'excel' ? 'xlsx' : 'pdf'}`,
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

    const { kpis = {}, chart_data, table_data = [] } = reportData;
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
              key.toLowerCase().includes('rechazad') ||
              key.toLowerCase().includes('pendiente') ||
              key.toLowerCase().includes('aire');
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
            <h3 className="text-subtitle2 font-bold mb-4 px-2">
              Comportamiento analítico principal
            </h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center -ml-2 sm:-ml-0">
              {activeTab === 'status' ? (
                <DonutChart labels={chartData.labels ?? []} series={flatSeries} />
              ) : activeTab === 'vs' ? (
                <LineChart categories={chartData.categories ?? []} series={namedSeries} />
              ) : (
                <BarChart
                  categories={chartData.categories ?? []}
                  series={namedSeries}
                  horizontal={false}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard className="pt-5 pb-2 px-3 sm:px-5 overflow-hidden flex flex-col w-full h-[360px]">
            <h3 className="text-subtitle2 font-bold mb-4 px-2">
              Métricas secundarias y proyecciones
            </h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center">
              {activeTab === 'vs' || activeTab === 'distributors' ? (
                <AreaChart categories={chartData.categories ?? []} series={namedSeries} />
              ) : activeTab === 'status' ? (
                <BarChart
                  categories={chartData.labels ?? []}
                  series={[{ name: 'Distribución', data: namedSeries[0]?.data ?? [] }]}
                  stacked={true}
                  horizontal={true}
                />
              ) : (
                <BarChart
                  categories={chartData.categories ?? []}
                  series={namedSeries}
                  stacked={true}
                  horizontal={true}
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
        title="Reportes de Ventas"
        subtitle="Analiza el rendimiento del área de cotizaciones B2B, tus embudos de ventas y el desempeño con clientes"
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
