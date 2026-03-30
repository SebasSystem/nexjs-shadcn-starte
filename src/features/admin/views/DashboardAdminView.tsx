'use client';

import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  SectionCardHeader,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { useTenants } from 'src/features/admin/hooks/use-tenants';
import {
  Building2,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Chart } from 'src/shared/components/chart';
import type ApexCharts from 'apexcharts';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { TenantDetailDrawer } from 'src/features/admin/components/tenant-detail-drawer';
import { TenantStatusBadge } from 'src/features/admin/components/tenant-status-badge';
import { Tenant } from 'src/features/admin/types/admin.types';
import {
  useTable,
  TableHeadCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatRelative(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Hace menos de 1h';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return `Hace ${Math.floor(diffD / 30)} mes(es)`;
}

const columnHelper = createColumnHelper<Tenant>();

export const DashboardAdminView = () => {
  const { tenants, isLoading, refetch, suspendTenant } = useTenants();

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleVerDetalle = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const handleSuspend = async (tenant: Tenant) => {
    await suspendTenant(tenant.id);
  };

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Tenant',
        cell: (info) => {
          const t = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(t.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-sm">{t.nombre}</p>
                <p className="text-xs text-muted-foreground">{t.dominio}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('planNombre', {
        header: 'Plan',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('totalUsuarios', {
        header: 'Usuarios',
        cell: (info) => {
          const t = info.row.original;
          return (
            <p className="text-sm text-foreground">
              {t.totalUsuarios} / {t.limiteUsuarios}
            </p>
          );
        },
      }),
      columnHelper.accessor('mrr', {
        header: 'MRR',
        cell: (info) => <span className="font-medium text-foreground">${info.getValue()}</span>,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <TenantStatusBadge estado={info.getValue()} />,
      }),
      columnHelper.accessor('ultimoAcceso', {
        header: 'Último acceso',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{formatRelative(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: '',
        cell: (info) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleVerDetalle(info.row.original);
              }}
            >
              Ver detalle
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ['#3B82F6'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (value: number) => `$${value.toLocaleString()}` } },
    tooltip: { y: { formatter: (value: number) => `$${value.toLocaleString()}` } },
  };

  const chartSeries = [{ name: 'MRR', data: [12000, 14500, 15200, 16800, 17200, 18420] }];

  const tenantsEnRiesgo = useMemo(() => {
    return tenants.filter((t) => t.estado === 'VENCIDO' || t.estado === 'SUSPENDIDO').slice(0, 5);
  }, [tenants]);

  const tenantsRecientes = useMemo(() => {
    return [...tenants]
      .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
      .slice(0, 10);
  }, [tenants]);

  const { table } = useTable({
    data: tenantsRecientes,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (isLoading) {
    return (
      <PageContainer>
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
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Global"
        subtitle="Vista general del sistema y estado de todos los tenants"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Tenants Activos"
          value={tenants.filter((t) => t.estado === 'ACTIVO').length}
          trend="+3 este mes"
          icon={<Building2 className="h-5 w-5" />}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          title="Ingreso Mensual (MRR)"
          value="$18,420"
          trend="+12% vs mes anterior"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Facturas Vencidas"
          value="7"
          trend="3 críticas"
          trendUp={false}
          icon={<AlertCircle className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Errores Críticos (24h)"
          value="2"
          trend="↓ vs ayer"
          trendUp={false}
          icon={<Activity className="h-5 w-5" />}
          iconClassName="bg-red-500/10 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SectionCard>
            <SectionCardHeader title="Evolución del MRR" subtitle="Últimos 6 meses" />
            <Chart type="area" series={chartSeries} options={chartOptions} height={280} />
          </SectionCard>
        </div>

        <div className="lg:col-span-5 flex flex-col h-full">
          <SectionCard className="flex-1 flex flex-col">
            <SectionCardHeader
              title="Requieren Atención"
              action={
                <Badge variant="soft" className="ml-2 bg-red-100 text-red-700 border-transparent">
                  {tenantsEnRiesgo.length}
                </Badge>
              }
            />
            <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3">
              {tenantsEnRiesgo.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3 opacity-80" />
                  <p className="text-body2 font-medium">Todo en orden</p>
                  <p className="text-caption mt-1">No hay tenants en riesgo actualmente.</p>
                </div>
              ) : (
                tenantsEnRiesgo.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback
                          className={
                            tenant.estado === 'SUSPENDIDO'
                              ? 'bg-red-100 text-red-700 font-bold'
                              : 'bg-amber-100 text-amber-700 font-bold'
                          }
                        >
                          {getInitials(tenant.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{tenant.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <TenantStatusBadge estado={tenant.estado} />
                          <span className="text-xs text-muted-foreground">{tenant.planNombre}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs shrink-0 text-blue-600"
                      onClick={() => handleVerDetalle(tenant)}
                    >
                      Ir al tenant &rarr;
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard noPadding>
        <div className="p-5 border-b border-border/40 flex justify-between items-center">
          <h2 className="text-h6 text-foreground">Tenants Recientes</h2>
          <Button variant="link" size="sm" className="text-sm font-medium pr-0">
            Ver todos los tenants &rarr;
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/10 hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleVerDetalle(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <TenantDetailDrawer
        tenant={selectedTenant}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSuspend={handleSuspend}
      />
    </PageContainer>
  );
};
