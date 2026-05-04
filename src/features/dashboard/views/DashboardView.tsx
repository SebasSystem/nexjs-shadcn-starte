'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { Chart, useChart } from 'src/shared/components/chart';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  SectionCardHeader,
} from 'src/shared/components/layouts/page';
import {
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  useTable,
} from 'src/shared/components/table';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Icon,
  type IconName,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'src/shared/components/ui';
import { Button } from 'src/shared/components/ui/button';

// ─── Mock data ────────────────────────────────────────────────────────────────
const KPIS: {
  label: string;
  value: string;
  trendPercent: string;
  trendUp: boolean;
  chartData: number[];
}[] = [
  {
    label: 'Total Contactos',
    value: '4,842',
    trendPercent: '+8.2% este mes',
    trendUp: true,
    chartData: [112, 130, 145, 150, 180, 210, 240, 290, 310, 345],
  },
  {
    label: 'Tasa de Conversión',
    value: '24.8%',
    trendPercent: '+2.1% (Pipeline)',
    trendUp: true,
    chartData: [20, 21, 23, 21, 22, 24, 25, 23, 24, 25],
  },
  {
    label: 'MRR Proyectado',
    value: '$42,500',
    trendPercent: '+12.5% este mes',
    trendUp: true,
    chartData: [38, 38.5, 39, 40, 40.2, 41, 41.5, 41.8, 42, 42.5],
  },
  {
    label: 'Clientes en Riesgo',
    value: '42',
    trendPercent: '-5% requieren acción',
    trendUp: false,
    chartData: [60, 58, 55, 52, 50, 48, 45, 44, 43, 42],
  },
];

const CARTERA_ETIQUETAS = [
  { name: 'VIP', count: 145 },
  { name: 'Recurrente', count: 320 },
  { name: 'Nuevo', count: 85 },
  { name: 'En Riesgo', count: 42 },
];

const VENTAS_SERIES = [
  { name: 'Ingresos Reales', type: 'column', data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30] },
  { name: 'Meta Proyectada', type: 'line', data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39] },
];

const STOCK_BAJO = [
  {
    icon: 'Shirt' as IconName,
    name: 'Camiseta Básica XL',
    sku: 'SKU-001-XL',
    actual: 3,
    minimo: 25,
    estado: 'Crítico',
    estadoColor: 'bg-red-500/10 text-red-600',
  },
  {
    icon: 'Footprints' as IconName,
    name: 'Zapatilla Running 42',
    sku: 'SKU-045-42',
    actual: 8,
    minimo: 20,
    estado: 'Bajo',
    estadoColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: 'SunSnow' as IconName,
    name: 'Gorra Deportiva Negra',
    sku: 'SKU-089-BK',
    actual: 12,
    minimo: 30,
    estado: 'Bajo',
    estadoColor: 'bg-amber-500/10 text-amber-600',
  },
];

const ULTIMAS_COTIZACIONES = [
  {
    id: 'COT-2024-0089',
    cliente: 'TechMex Solutions',
    initials: 'T',
    avatarBg: 'bg-blue-500',
    monto: '$45,200',
    estado: 'Pendiente',
    estadoColor: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500',
    fecha: '15 Ene 2024',
  },
  {
    id: 'COT-2024-0088',
    cliente: 'Global Industries SA',
    initials: 'G',
    avatarBg: 'bg-fuchsia-400',
    monto: '$128,750',
    estado: 'Aprobada',
    estadoColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500',
    fecha: '14 Ene 2024',
  },
  {
    id: 'COT-2024-0087',
    cliente: 'Alimentos del Sur',
    initials: 'A',
    avatarBg: 'bg-red-400',
    monto: '$23,400',
    estado: 'Rechazada',
    estadoColor: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500',
    fecha: '12 Ene 2024',
  },
  {
    id: 'COT-2024-0086',
    cliente: 'Constructora López',
    initials: 'C',
    avatarBg: 'bg-emerald-400',
    monto: '$87,300',
    estado: 'En revisión',
    estadoColor: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    fecha: '10 Ene 2024',
  },
];

type StockItem = (typeof STOCK_BAJO)[0];
const columnHelper = createColumnHelper<StockItem>();

const COLUMNS = [
  columnHelper.accessor('name', {
    header: 'Producto',
    cell: (info) => (
      <div className="flex items-center gap-2.5">
        <Icon name={info.row.original.icon} size={18} className="text-muted-foreground" />
        <span className="font-medium text-foreground">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('sku', {
    header: 'SKU',
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('actual', {
    header: () => <div className="text-right w-full">Actual</div>,
    cell: (info) => (
      <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor('minimo', {
    header: () => <div className="text-right w-full">Mínimo</div>,
    cell: (info) => <div className="text-right font-semibold text-primary">{info.getValue()}</div>,
  }),
  columnHelper.accessor('estado', {
    header: () => <div className="text-right w-full">Estado</div>,
    cell: (info) => (
      <div className="text-right">
        <Badge
          variant="soft"
          className={cn(
            'px-3 py-1 font-semibold rounded-full border-none',
            info.row.original.estadoColor
          )}
        >
          {info.getValue()}
        </Badge>
      </div>
    ),
  }),
];

import { ACTION_ICONS } from 'src/shared/constants/app-icons';

const TAREAS_VENCIDAS_HOY = [
  {
    id: 'TASK-1041',
    titulo: 'Enviar propuesta comercial',
    cliente: 'TechMex Solutions',
    responsable: 'Carlos V.',
    vencimiento: 'Hoy 09:00',
    prioridad: 'Alta',
    prioridadColor: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'TASK-1038',
    titulo: 'Seguimiento post-demo',
    cliente: 'Global Industries SA',
    responsable: 'Laura M.',
    vencimiento: 'Hoy 10:30',
    prioridad: 'Alta',
    prioridadColor: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'TASK-1035',
    titulo: 'Confirmar renovación contrato',
    cliente: 'Alimentos del Sur',
    responsable: 'Ana R.',
    vencimiento: 'Hoy 11:00',
    prioridad: 'Media',
    prioridadColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'TASK-1031',
    titulo: 'Llamada de bienvenida',
    cliente: 'Constructora López',
    responsable: 'Luis P.',
    vencimiento: 'Hoy 12:00',
    prioridad: 'Media',
    prioridadColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'TASK-1028',
    titulo: 'Actualizar datos de contacto',
    cliente: 'Fashion Retail SRL',
    responsable: 'Carlos V.',
    vencimiento: 'Hoy 14:00',
    prioridad: 'Baja',
    prioridadColor: 'bg-blue-500/10 text-blue-600',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function DashboardView() {
  const { table, dense, onChangeDense } = useTable({
    data: STOCK_BAJO,
    columns: COLUMNS,
    defaultRowsPerPage: 5,
  });

  type CotizacionItem = (typeof ULTIMAS_COTIZACIONES)[0];
  const colHelperCotizaciones = createColumnHelper<CotizacionItem>();

  const COLUMNS_COTIZACIONES = [
    colHelperCotizaciones.accessor('id', {
      header: 'N° Cotización',
      cell: (info) => <span className="font-medium text-muted-foreground">{info.getValue()}</span>,
    }),
    colHelperCotizaciones.accessor('cliente', {
      header: 'Cliente',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <Avatar size={32}>
            <AvatarFallback className={cn('text-white text-xs', info.row.original.avatarBg)}>
              {info.row.original.initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{info.getValue()}</span>
        </div>
      ),
    }),
    colHelperCotizaciones.accessor('monto', {
      header: 'Monto',
      cell: (info) => <span className="font-bold text-foreground">{info.getValue()}</span>,
    }),
    colHelperCotizaciones.accessor('estado', {
      header: 'Estado',
      cell: (info) => (
        <Badge
          variant="soft"
          className={cn(
            'px-3 py-1 font-semibold rounded-full border-none',
            info.row.original.estadoColor
          )}
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    colHelperCotizaciones.accessor('fecha', {
      header: 'Fecha',
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    colHelperCotizaciones.display({
      id: 'acciones',
      header: 'Acciones',
      cell: () => (
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Icon name={ACTION_ICONS.VIEW} size={16} />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Icon name={ACTION_ICONS.EDIT} size={16} />
          </button>
        </div>
      ),
    }),
  ];

  const {
    table: cotizacionesTable,
    dense: cotizacionesDense,
    onChangeDense: onCotizacionesChangeDense,
  } = useTable({
    data: ULTIMAS_COTIZACIONES,
    columns: COLUMNS_COTIZACIONES,
    defaultRowsPerPage: 5,
  });

  const chartOptions = useChart({
    labels: CARTERA_ETIQUETAS.map((b) => b.name),
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], // Blue, Green, Yellow, Red
    stroke: { show: false },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} contactos` },
    },
  });

  const salesChartOptions = useChart({
    stroke: { width: [0, 3] },
    plotOptions: { bar: { columnWidth: '20%', borderRadius: 4 } },
    fill: { type: ['solid', 'solid'] },
    colors: ['#3B82F6', '#10B981'],
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
    xaxis: { type: 'category' },
    yaxis: {
      labels: { formatter: (val: number) => `$${val}k` },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `$${val},000` },
    },
  });

  const sparklineOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        columnWidth: '75%',
        borderRadius: 2,
        borderRadiusApplication: 'end',
      },
    },
    yaxis: {
      show: false,
      labels: { show: false },
    },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
      marker: { show: false },
    },
  });

  return (
    <PageContainer>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle="Descripción general del sistema"
        action={
          <Link href={paths.sales.pipeline}>
            <Button color="primary" size="sm">
              <Icon name="TrendingUp" size={15} />
              Ir al Pipeline Comercial
            </Button>
          </Link>
        }
      />

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="group bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col justify-between"
          >
            <p className="text-sm font-semibold text-foreground mb-4">{kpi.label}</p>

            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>

              <div className="w-[84px] h-[48px] shrink-0">
                <Chart
                  type="bar"
                  series={[{ data: kpi.chartData }]}
                  options={{
                    ...sparklineOptions,
                    colors: [kpi.trendUp ? '#10B981' : '#EF4444'], // success o error hex
                  }}
                  height={48}
                  width="100%"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4">
              <Icon
                name={kpi.trendUp ? 'TrendingUp' : 'TrendingDown'}
                size={16}
                className={kpi.trendUp ? 'text-success' : 'text-error'}
              />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                <span className="text-foreground font-semibold mr-1">
                  {kpi.trendPercent.split(' ')[0]}
                </span>
                {kpi.trendPercent.split(' ').slice(1).join(' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Distribución B2B + Stock ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Distribución de Cartera */}
        <SectionCard>
          <SectionCardHeader
            title="Distribución de Cartera"
            subtitle="Contactos por Etiqueta (Tags)"
            action={
              <Link href={paths.settings.tags}>
                <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  Gestionar Etiquetas →
                </button>
              </Link>
            }
          />
          <div className="flex justify-center items-center mt-2 -mb-2">
            <Chart
              type="donut"
              series={CARTERA_ETIQUETAS.map((b) => b.count)}
              options={chartOptions}
              height={260}
            />
          </div>
        </SectionCard>

        {/* Tareas Vencidas Hoy */}
        <SectionCard noPadding>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <Icon name="Clock" size={15} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-subtitle1 font-semibold text-foreground">
                  Tareas Vencidas Hoy
                </h3>
                <p className="text-caption text-muted-foreground">Requieren atención inmediata</p>
              </div>
            </div>
            <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Ver todas <Icon name="ChevronRight" size={14} />
            </button>
          </div>

          {/* Mini métricas */}
          <div className="grid grid-cols-3 gap-3 px-5 pb-4">
            <div className="rounded-xl bg-red-500/10 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-red-600 leading-none">
                {TAREAS_VENCIDAS_HOY.length}
              </p>
              <p className="text-[10px] font-medium text-red-600/80 mt-1">Total vencidas</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-amber-600 leading-none">
                {TAREAS_VENCIDAS_HOY.filter((t) => t.prioridad === 'Alta').length}
              </p>
              <p className="text-[10px] font-medium text-amber-600/80 mt-1">Alta prioridad</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-blue-600 leading-none">
                {TAREAS_VENCIDAS_HOY.filter((t) => t.prioridad === 'Media').length}
              </p>
              <p className="text-[10px] font-medium text-blue-600/80 mt-1">Media prioridad</p>
            </div>
          </div>

          {/* Lista */}
          <div className="divide-y divide-border/40">
            {TAREAS_VENCIDAS_HOY.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                    <Icon name="AlertCircle" size={14} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-subtitle2 text-foreground truncate">{t.titulo}</p>
                    <p className="text-caption text-muted-foreground truncate">
                      {t.cliente} · {t.responsable}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge
                    variant="soft"
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border-none',
                      t.prioridadColor
                    )}
                  >
                    {t.prioridad}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground w-16 text-right">
                    {t.vencimiento}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Evolución de Ventas ────────────────────────────────────────── */}
      <div className="mb-4">
        <SectionCard>
          <SectionCardHeader
            title="Rendimiento de Ventas"
            subtitle="Ingresos Reales vs. Meta Proyectada"
          />
          <div className="mt-2">
            <Chart type="line" series={VENTAS_SERIES} options={salesChartOptions} height={320} />
          </div>
        </SectionCard>
      </div>

      {/* ── Productos con Stock Bajo ──────────────────────────────────── */}
      <SectionCard noPadding>
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Icon name="AlertTriangle" size={15} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-h6 font-semibold text-foreground">Productos con Stock Bajo</h2>
              <p className="text-body2 text-muted-foreground">Requieren atención inmediata</p>
            </div>
          </div>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            Exportar CSV
          </button>
        </div>

        {/* Table con TanStack */}
        <TableContainer className="relative">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      {/* ── Últimas Cotizaciones ─────────────────────────────────────── */}
      <SectionCard noPadding>
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">Últimas Cotizaciones</h2>
            <p className="text-sm text-muted-foreground">Cotizaciones creadas recientemente</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Ver todas <Icon name="ChevronRight" size={16} />
          </button>
        </div>

        {/* Table con TanStack */}
        <TableContainer className="relative">
          <Table>
            <TableHeadCustom table={cotizacionesTable} />
            <TableBody dense={cotizacionesDense}>
              {cotizacionesTable.getRowModel().rows.map((row) => (
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
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom
            table={cotizacionesTable}
            dense={cotizacionesDense}
            onChangeDense={onCotizacionesChangeDense}
          />
        </div>
      </SectionCard>
    </PageContainer>
  );
}
