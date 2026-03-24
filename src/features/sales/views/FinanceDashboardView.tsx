'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { TrendingUp, Clock, AlertCircle, BarChart2 } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { Card, CardContent } from 'src/shared/components/ui/card';
import { Table, TableBody, TableRow, TableCell } from 'src/shared/components/ui';
import { PageContainer, PageHeader, StatsCard } from 'src/shared/components/layouts/page';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ─── Mock Data ────────────────────────────────────────────────────────────────

type InvoiceRow = {
  id: string;
  client: string;
  date: string;
  amount: number;
  status: string;
};

const LAST_INVOICES: InvoiceRow[] = [
  {
    id: 'FAC-2024-0042',
    client: 'Tecnología Global S.A.',
    date: '15 Ene 2024',
    amount: 45680,
    status: 'parcial',
  },
  {
    id: 'FAC-2024-0041',
    client: 'Grupo Industrial del Norte',
    date: '14 Ene 2024',
    amount: 128500,
    status: 'pagada',
  },
  {
    id: 'FAC-2024-0040',
    client: 'Distribuidora Central',
    date: '10 Ene 2024',
    amount: 23400,
    status: 'vencida',
  },
  {
    id: 'FAC-2024-0039',
    client: 'Tecnologías Modernas S.A.',
    date: '08 Ene 2024',
    amount: 67200,
    status: 'pendiente',
  },
  {
    id: 'FAC-2024-0038',
    client: 'Servicios Empresariales MX',
    date: '05 Ene 2024',
    amount: 15800,
    status: 'pagada',
  },
  {
    id: 'FAC-2024-0037',
    client: 'Consultores del Bajío',
    date: '03 Ene 2024',
    amount: 89100,
    status: 'pagada',
  },
];

const WEEKLY_SALES_DATA = [142000, 98000, 165000, 120000, 178000, 87000, 154000, 130000];
const DATE_FILTERS = ['Esta semana', 'Este mes', 'Último trimestre'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatusKey = 'pagada' | 'pendiente' | 'vencida' | 'parcial';

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; color: 'success' | 'warning' | 'error' | 'primary' }
> = {
  pagada: { label: 'Pagada', color: 'success' },
  pendiente: { label: 'Pendiente', color: 'warning' },
  vencida: { label: 'Vencida', color: 'error' },
  parcial: { label: 'Parcial', color: 'primary' },
};

// ─── Chart Options ────────────────────────────────────────────────────────────

const chartOptions: ApexCharts.ApexOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'inherit',
  },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  colors: ['#2563EB'],
  xaxis: {
    categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '12px' },
      formatter: (val: number) => `$${(val / 1000).toFixed(0)}K`,
    },
  },
  grid: { borderColor: 'rgba(148,163,184,0.1)', strokeDashArray: 4 },
  tooltip: {
    y: {
      formatter: (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val),
    },
  },
  theme: { mode: 'dark' },
};

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<InvoiceRow>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function FinanceDashboardView() {
  const [activeDateFilter, setActiveDateFilter] = useState('Este mes');

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'N° Factura',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('client', {
        header: 'Cliente',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', {
        header: 'Fecha',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('amount', {
        header: () => <div className="text-right w-full">Monto</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {formatMXN(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const cfg = STATUS_CONFIG[info.getValue() as StatusKey] ?? STATUS_CONFIG.pendiente;
          return (
            <Badge variant="soft" color={cfg.color}>
              {cfg.label}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center w-full">Acciones</div>,
        cell: () => (
          <div className="flex justify-center">
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: LAST_INVOICES,
    columns,
    defaultRowsPerPage: 5,
  });

  return (
    <PageContainer className="pb-10">
      {/* Header */}
      <PageHeader
        title="Dashboard Financiero"
        subtitle="Resumen de ventas, facturas y cartera de este período"
      />

      {/* Date filter buttons */}
      <div className="flex items-center gap-2">
        {DATE_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveDateFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeDateFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Ventas del Mes"
          value={formatMXN(842300)}
          trend="+12% vs mes anterior"
          trendUp={true}
          icon={<TrendingUp size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
        <StatsCard
          title="Facturas Pendientes"
          value="23 facturas"
          trend={`${formatMXN(187500)} pendiente`}
          trendUp={false}
          icon={<Clock size={20} />}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="Cartera Vencida"
          value={formatMXN(43200)}
          trend="3 clientes en mora"
          trendUp={false}
          icon={<AlertCircle size={20} />}
          iconClassName="bg-red-500/10 text-red-500"
        />
        <StatsCard
          title="Margen Promedio"
          value="48.3%"
          trend="Meta: 45%"
          trendUp={true}
          icon={<BarChart2 size={20} />}
          iconClassName="bg-indigo-500/10 text-indigo-500"
        />
      </div>

      {/* Sales Chart */}
      <Card className="border-none shadow-card">
        <CardContent className="p-6">
          <h2 className="text-h6 text-foreground mb-1">Ventas por semana</h2>
          <p className="text-body2 text-muted-foreground mb-5">Últimas 8 semanas</p>
          <ReactApexChart
            options={chartOptions}
            series={[{ name: 'Ventas', data: WEEKLY_SALES_DATA }]}
            type="bar"
            height={280}
          />
        </CardContent>
      </Card>

      {/* Invoices Table — TanStack */}
      <Card className="border-none shadow-card py-0 gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-h6 text-foreground">Últimas Facturas</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </Card>
    </PageContainer>
  );
}
