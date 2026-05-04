'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { formatMoney } from 'src/lib/currency';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

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
      formatter: (val: number) => `${(val / 1000).toFixed(0)}K`,
    },
  },
  grid: { borderColor: 'rgba(148,163,184,0.1)', strokeDashArray: 4 },
  tooltip: {
    y: {
      formatter: (val: number) => formatMoney(val, { maximumFractionDigits: 0 }),
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
            {formatMoney(info.getValue(), { maximumFractionDigits: 0 })}
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
          value={formatMoney(842300, { maximumFractionDigits: 0 })}
          trend="+12% vs mes anterior"
          trendUp={true}
          icon={<Icon name="TrendingUp" size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
        <StatsCard
          title="Facturas Pendientes"
          value="23 facturas"
          trend={`${formatMoney(187500, { maximumFractionDigits: 0 })} pendiente`}
          trendUp={false}
          icon={<Icon name="Clock" size={20} />}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="Cartera Vencida"
          value={formatMoney(43200, { maximumFractionDigits: 0 })}
          trend="3 clientes en mora"
          trendUp={false}
          icon={<Icon name="AlertCircle" size={20} />}
          iconClassName="bg-red-500/10 text-red-500"
        />
        <StatsCard
          title="Margen Promedio"
          value="48.3%"
          trend="Meta: 45%"
          trendUp={true}
          icon={<Icon name="BarChart2" size={20} />}
          iconClassName="bg-indigo-500/10 text-indigo-500"
        />
      </div>

      {/* Sales Chart */}
      <SectionCard>
        <h2 className="text-h6 text-foreground mb-1">Ventas por semana</h2>
        <p className="text-body2 text-muted-foreground mb-5">Últimas 8 semanas</p>
        <ReactApexChart
          options={chartOptions}
          series={[{ name: 'Ventas', data: WEEKLY_SALES_DATA }]}
          type="bar"
          height={280}
        />
      </SectionCard>

      {/* Invoices Table — TanStack */}
      <SectionCard noPadding>
        <div className="px-6 py-4">
          <h2 className="text-h6 text-foreground">Últimas Facturas</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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

        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>
    </PageContainer>
  );
}
