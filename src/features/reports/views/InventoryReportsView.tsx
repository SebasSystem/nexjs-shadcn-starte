'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button } from 'src/shared/components/ui';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import { ReportFilters } from '../components/ReportFilters';
import { ExportBar } from '../components/ExportBar';
import { ReportTable } from '../components/tables/ReportTable';
import { BarChart, DonutChart, LineChart, AreaChart } from '../components/charts/ReportCharts';
import { 
  mockInventoryCategories,
  mockInventoryRisk,
  mockInventoryMovements,
  mockInventoryStockByWarehouse,
  mockInventoryB2B,
} from 'src/_mock/_reports';
import { toast } from 'sonner';

const DATA_MAP: Record<string, () => any> = {
  'bodega': mockInventoryStockByWarehouse,
  'riesgo': mockInventoryRisk,
  'movimientos': mockInventoryMovements,
  'categoria': mockInventoryCategories,
  'b2b': mockInventoryB2B,
};

const TABS = [
  { id: 'bodega', label: 'Stock por bodega' },
  { id: 'riesgo', label: 'Productos en riesgo' },
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'categoria', label: 'Resumen por categoría' },
  { id: 'b2b', label: 'Reservas B2B' },
];

export function InventoryReportsView() {
  const [activeTab, setActiveTab] = useState<string>('bodega');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const reportData = DATA_MAP[activeTab]();

  const doExport = async (type: 'excel' | 'pdf', fields: string[]) => {
    setExportLoading(type);
    await new Promise(r => setTimeout(r, 800));
    setExportLoading(null);
    if (type === 'excel') toast.success(`MOCK: La descarga del archivo Excel se gestionará próximamente desde el backend.`);
    else toast.info('La exportación a PDF estará disponible cuando se conecte el servicio de reportes.');
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><div className="h-24 bg-muted rounded-xl"/><div className="h-24 bg-muted rounded-xl"/><div className="h-24 bg-muted rounded-xl"/><div className="h-24 bg-muted rounded-xl"/></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="h-[300px] bg-muted rounded-xl"/><div className="h-[300px] bg-muted rounded-xl"/></div>
          <div className="h-[200px] bg-muted rounded-xl w-full" />
        </div>
      );
    }

    const kpis = reportData.kpis || {};
    const chartData = reportData.chartData || { series:[], categories:[], labels:[] };
    const tableData = reportData.tableData || [];
    const mostCritical = reportData.mostCritical;
    
    const columns = tableData.length > 0 
      ? Object.keys(tableData[0]).filter(k => !k.includes('id') && k !== 'items').map(k => ({ id:k, label: k === 'statusBadge' ? 'Estado' : k.charAt(0).toUpperCase() + k.slice(1) }))
      : [];

    return (
      <div className="w-full max-w-full space-y-6">
        {/* KPIs */}
        <div className="flex flex-wrap gap-4 pb-2">
          {Object.entries(kpis).map(([key, val]) => (
            <div key={key} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm min-w-[140px] sm:min-w-[200px] flex-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 truncate">{key}</p>
              <p className={cn(
                "text-2xl font-extrabold tracking-tight tabular-nums",
                (key.toLowerCase().includes('agotado') || key.toLowerCase().includes('crítico') || key.toLowerCase().includes('descuadre') || (typeof val === 'number' && val > 0 && key.toLowerCase().includes('riesgo'))) ? 'text-error' : 'text-foreground'
              )}>
                {String(val)}
              </p>
            </div>
          ))}
        </div>

        {/* Gráficas Duplicadas por layout responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <div className="bg-card border border-border/50 rounded-xl pt-5 pb-2 px-3 sm:px-5 shadow-sm overflow-hidden flex flex-col w-full h-[360px]">
            <h3 className="text-subtitle2 font-bold mb-4 px-2">Comportamiento analítico</h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center -ml-2 sm:-ml-0">
              {activeTab === 'riesgo' ? (
                <DonutChart labels={chartData.labels} series={chartData.series} />
              ) : activeTab === 'movimientos' ? (
                <LineChart categories={chartData.categories} series={chartData.series} />
              ) : (
                <BarChart categories={chartData.categories || []} series={chartData.series} horizontal={activeTab === 'b2b'} />
              )}
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl pt-5 pb-2 px-3 sm:px-5 shadow-sm overflow-hidden flex flex-col w-full h-[360px]">
            <h3 className="text-subtitle2 font-bold mb-4 px-2">
              {activeTab === 'riesgo' ? 'Producto más crítico' : 'Vista de áreas / Comparativa'}
            </h3>
            <div className="flex-1 w-full min-w-0 flex items-center justify-center">
              {activeTab === 'riesgo' && mostCritical ? (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-error/10 border border-error/20 rounded-xl w-full h-full">
                  <Icon name="AlertTriangle" size={48} className="text-error mb-4" />
                  <p className="text-body2 text-muted-foreground">{mostCritical.sku}</p>
                  <p className="text-subtitle1 font-bold text-foreground mb-4">{mostCritical.name}</p>
                  <p className="text-4xl font-black text-error mb-2">{mostCritical.available}</p>
                  <p className="text-caption text-muted-foreground mb-4">Stock disponible frente a {mostCritical.minStock} min.</p>
                  <Button variant="outline" size="sm" color="error">Ver en inventario</Button>
                </div>
              ) : activeTab === 'categoria' || activeTab === 'b2b' ? (
                <AreaChart categories={chartData.categories || []} series={chartData.series} />
              ) : (
                <BarChart categories={chartData.categories || []} series={chartData.series} stacked={true} />
              )}
            </div>
          </div>

        </div>

        {/* Tabla nativa */}
        <div className="w-full">
          <ReportTable columns={columns} data={tableData} />
        </div>
      </div>
    );
  };

  const columnsContext = (reportData && reportData.tableData && reportData.tableData.length > 0)
      ? Object.keys(reportData.tableData[0]).filter(k => !k.includes('id') && k !== 'items').map(k => ({ id:k, label: k === 'statusBadge' ? 'Estado' : k.charAt(0).toUpperCase() + k.slice(1) }))
      : [];

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reportes de Inventario"
        subtitle="Analiza y centraliza la información de los diferentes rubros de tu inventario"
      />

      {/* Zona 2: Panel de Filtros */}
      <div className="w-full mb-6">
        <ReportFilters />
      </div>

        {/* Zona 3: Tabs de Reportes */}
        <div className="flex-none border-b border-border/60 overflow-x-auto w-full mb-6">
          <div className="flex gap-6 min-w-max px-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap",
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

        {/* Barra de Exportación */}
        <ExportBar
          columns={columnsContext}
          hasData={!!reportData && reportData.tableData.length > 0}
          loading={exportLoading}
          onExportExcel={(fields) => doExport('excel', fields)}
          onExportPdf={(fields) => doExport('pdf', fields)}
        />

        {/* Contenido Dinámico */}
        <div className="w-full relative pb-4">
          {renderTabContent()}
        </div>
    </PageContainer>
  );
}
