'use client';

import Link from 'next/link';
import {
  Icon,
  type IconName,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  AvatarFallback,
  Badge,
} from 'src/shared/components/ui';
import { Button } from 'src/shared/components/ui/button';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Chart, useChart } from 'src/shared/components/chart';
import { paths } from 'src/routes/paths';

import { cn } from 'src/lib/utils';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  SectionCardHeader,
} from 'src/shared/components/layouts/page';

// ─── Mock data ────────────────────────────────────────────────────────────────
const KPIS: {
  label: string;
  value: string;
  trendPercent: string;
  trendUp: boolean;
  chartData: number[];
}[] = [
  {
    label: 'Unidades totales',
    value: '2,847',
    trendPercent: '+2.6% este mes',
    trendUp: true,
    chartData: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
  },
  {
    label: 'Stock disponible',
    value: '2,412',
    trendPercent: '+5.2% este mes',
    trendUp: true,
    chartData: [20, 41, 63, 33, 28, 90, 50, 42, 109, 38],
  },
  {
    label: 'Stock reservado',
    value: '435',
    trendPercent: '+15.3% canales',
    trendUp: true,
    chartData: [8, 9, 31, 8, 16, 21, 4, 11, 15, 36],
  },
  {
    label: 'Stock crítico',
    value: '8',
    trendPercent: '-2.1% requieren acción',
    trendUp: false,
    chartData: [20, 24, 18, 15, 16, 12, 10, 8, 5, 2],
  },
];

const BODEGAS = [
  { name: 'Bodega Principal', units: 1892 },
  { name: 'Tienda Física', units: 955 },
];

const RESERVAS = [
  {
    initials: 'D',
    avatarBg: 'bg-blue-500',
    name: 'Distribuidora Mayorista',
    cod: 'COT-2024-0166',
    uds: '150 uds',
    time: 'Hace 2h',
    status: 'Pendiente',
    statusColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    initials: 'R',
    avatarBg: 'bg-rose-500',
    name: 'Retail Corp',
    cod: 'COT-2024-0165',
    uds: '85 uds',
    time: 'Hace 5h',
    status: 'Confirmado',
    statusColor: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    initials: 'S',
    avatarBg: 'bg-violet-500',
    name: 'Super Norte',
    cod: 'COT-2024-0164',
    uds: '200 uds',
    time: 'Hace 1d',
    status: 'En proceso',
    statusColor: 'bg-blue-500/10 text-blue-600',
  },
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
    labels: BODEGAS.map((b) => b.name),
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
      y: { formatter: (val: number) => `${val} uds` },
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

      {/* ── Stock por Bodega + Reservas B2B ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock por Bodega */}
        <SectionCard>
          <SectionCardHeader
            title="Stock por Bodega"
            subtitle="Distribución actual"
            action={
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Ver detalle →
              </button>
            }
          />
          <div className="flex justify-center items-center mt-2 -mb-2">
            <Chart
              type="donut"
              series={BODEGAS.map((b) => b.units)}
              options={chartOptions}
              height={260}
            />
          </div>
        </SectionCard>

        {/* Reservas B2B Recientes */}
        <SectionCard>
          <SectionCardHeader
            title="Reservas B2B Recientes"
            subtitle={`${RESERVAS.length} operaciones activas`}
            action={
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Ver todas →
              </button>
            }
          />
          <div className="space-y-1">
            {RESERVAS.map((r) => (
              <div
                key={r.cod}
                className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <Avatar size={40}>
                    <AvatarFallback className={cn('text-white', r.avatarBg)}>
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-subtitle2 text-foreground">{r.name}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">{r.cod}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-subtitle2 text-foreground">{r.uds}</p>
                  <Badge
                    variant="soft"
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border-none',
                      r.statusColor
                    )}
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Productos con Stock Bajo ──────────────────────────────────── */}
      <SectionCard noPadding>
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
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
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'transition-colors',
                    i < STOCK_BAJO.length - 1 && 'border-border/40' // keep consistent separators
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('px-5', dense ? 'py-2' : 'py-3.5')}>
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

      {/* ── Últimas Cotizaciones ─────────────────────────────────────── */}
      <SectionCard noPadding>
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">Últimas Cotizaciones</h2>
            <p className="text-sm text-muted-foreground">Cotizaciones creadas recientemente</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Ver todas <Icon name="ChevronRight" size={16} />
          </button>
        </div>

        {/* Table con TanStack */}
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeadCustom table={cotizacionesTable} />
            <TableBody>
              {cotizacionesTable.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'transition-colors',
                    i < ULTIMAS_COTIZACIONES.length - 1 && 'border-b border-border/40'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn('px-5', cotizacionesDense ? 'py-3' : 'py-4')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
