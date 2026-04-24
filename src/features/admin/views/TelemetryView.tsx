'use client';

import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { useTelemetry } from 'src/features/admin/hooks/use-telemetry';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { LogsFeed } from 'src/features/admin/components/logs-feed';
import { AlertsDrawer } from 'src/features/admin/components/alerts-drawer';
import { Badge } from 'src/shared/components/ui/badge';
import { Switch } from 'src/shared/components/ui/switch';
import { TenantStatusBadge } from 'src/features/admin/components/tenant-status-badge';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

const MOCK_TENANT_ERRORS = [
  {
    id: 't1',
    nombre: 'Delta Comercial',
    errores: 78,
    tipo: '503 Service Unavailable',
    time: 'Hace 5 min',
    severidad: 'CRITICO',
    estado: 'ACTIVO',
  },
  {
    id: 't2',
    nombre: 'Acme Corporation',
    errores: 43,
    tipo: '500 Internal Error',
    time: 'Hace 12 min',
    severidad: 'ALTO',
    estado: 'ACTIVO',
  },
  {
    id: 't3',
    nombre: 'Beta Soluciones',
    errores: 12,
    tipo: 'Rate Limit',
    time: 'Hace 45 min',
    severidad: 'MEDIO',
    estado: 'VENCIDO',
  },
  {
    id: 't4',
    nombre: 'Gamma Tech',
    errores: 2,
    tipo: '404 Not Found',
    time: 'Hace 2h',
    severidad: 'BAJO',
    estado: 'TRIAL',
  },
];

type TenantError = (typeof MOCK_TENANT_ERRORS)[0];
type Alerta = ReturnType<typeof useTelemetry>['alertas'][0];

const tenantErrorColumnHelper = createColumnHelper<TenantError>();
const alertaColumnHelper = createColumnHelper<Alerta>();

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const TelemetryView = () => {
  const { logs, alertas, isLoading, toggleAlerta, updateAlerta, saveAlerta } = useTelemetry();

  const [isAlertasOpen, setIsAlertasOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'errores' | 'logs' | 'alertas'>('errores');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAlerta, setSelectedAlerta] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenAlertas = (alerta: any = null) => {
    setSelectedAlerta(alerta);
    setIsAlertasOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveAlerta = async (data: any) => {
    if (selectedAlerta) {
      await updateAlerta(selectedAlerta.id, data);
    } else {
      await saveAlerta(data);
    }
  };

  const ERRORS_COLUMNS = useMemo(
    () => [
      tenantErrorColumnHelper.accessor('nombre', {
        header: 'Tenant',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                {getInitials(info.getValue())}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground text-sm">{info.getValue()}</span>
          </div>
        ),
      }),
      tenantErrorColumnHelper.accessor('errores', {
        header: 'Errores 24h',
        cell: (info) => (
          <span
            className={`font-semibold ${
              info.getValue() > 50
                ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'
                : 'text-foreground'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      tenantErrorColumnHelper.accessor('tipo', {
        header: 'Tipo más frecuente',
        cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue()}</span>,
      }),
      tenantErrorColumnHelper.accessor('time', {
        header: 'Último error',
        cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue()}</span>,
      }),
      tenantErrorColumnHelper.accessor('severidad', {
        header: 'Severidad',
        cell: (info) => {
          const s = info.getValue();
          return (
            <Badge
              variant="outline"
              className={`${
                s === 'CRITICO'
                  ? 'bg-red-100 text-red-700 border-transparent'
                  : s === 'ALTO'
                    ? 'bg-amber-100 text-amber-700 border-transparent'
                    : s === 'MEDIO'
                      ? 'bg-orange-100 text-orange-700 border-transparent'
                      : 'bg-gray-100 text-gray-500 border-transparent'
              }`}
            >
              {s}
            </Badge>
          );
        },
      }),
      tenantErrorColumnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => (
          <TenantStatusBadge
            estado={info.getValue() as 'ACTIVO' | 'TRIAL' | 'VENCIDO' | 'SUSPENDIDO'}
          />
        ),
      }),
      tenantErrorColumnHelper.display({
        id: 'accion',
        header: 'Acción',
        cell: () => (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 font-medium h-8 hover:bg-blue-50"
          >
            Ver logs <Icon name="ArrowRight" className="h-3.5 w-3.5 ml-1" />
          </Button>
        ),
      }),
    ],
    []
  );

  const ALERTAS_COLUMNS = useMemo(
    () => [
      alertaColumnHelper.accessor('nombre', {
        header: 'Alerta',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      alertaColumnHelper.accessor('condicion', {
        header: 'Condición',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      alertaColumnHelper.accessor('canal', {
        header: 'Canal',
        cell: (info) => (
          <div className="flex gap-1.5 flex-wrap">
            {info.getValue().map((c: string) => (
              <Badge key={c} variant="outline" className="text-[10px] bg-card">
                {c}
              </Badge>
            ))}
          </div>
        ),
      }),
      alertaColumnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const alerta = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={alerta.estado === 'ACTIVO'}
                onCheckedChange={() => toggleAlerta(alerta.id)}
              />
              <span className="text-xs text-muted-foreground">
                {alerta.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          );
        },
      }),
      alertaColumnHelper.accessor('ultimaActivacion', {
        header: 'Última activación',
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue()
              ? new Date(info.getValue() as string).toLocaleDateString('es-MX')
              : 'Nunca'}
          </span>
        ),
      }),
      alertaColumnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <div className="text-right">
            <Button variant="ghost" size="sm" onClick={() => handleOpenAlertas(info.row.original)}>
              Editar
            </Button>
          </div>
        ),
      }),
    ],
    [toggleAlerta]
  );

  const erroresTable = useTable({
    data: MOCK_TENANT_ERRORS,
    columns: ERRORS_COLUMNS,
    defaultRowsPerPage: 25,
  });

  const alertasTable = useTable({
    data: alertas,
    columns: ALERTAS_COLUMNS,
    defaultRowsPerPage: 25,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Telemetría Global"
        subtitle="Monitoreo de errores y salud del sistema por tenant"
        action={
          <Button color="primary" onClick={() => handleOpenAlertas()} className="gap-2">
            <Icon name="Settings" className="h-4 w-4" />
            Configurar Alertas
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Uptime Global"
          value="99.94%"
          trend="SLA: 99.9%"
          icon={<Icon name="CheckCircle2" className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Errores 24h"
          value="143"
          trend="-22% vs ayer"
          trendUp={false}
          icon={<Icon name="AlertOctagon" className="h-5 w-5" />}
          iconClassName="bg-red-500/10 text-red-600"
        />
        <StatsCard
          title="Tenants con errores"
          value="8"
          trend="5 críticos"
          icon={<Icon name="Building2" className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Latencia P95"
          value="240ms"
          trend="↑ +30ms vs ayer"
          trendUp={false}
          icon={<Icon name="Zap" className="h-5 w-5" />}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
      </div>

      <SectionCard noPadding className="flex-1 flex flex-col min-h-[500px]">
        {/* Tab bar — patrón idéntico a ContactsView con -mb-px para flush underline */}
        <div className="flex gap-1 border-b border-border/40 px-2">
          {(['errores', 'logs', 'alertas'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === t
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'errores'
                ? 'Errores por Tenant'
                : t === 'logs'
                  ? 'Logs del Sistema'
                  : 'Alertas Activas'}
            </button>
          ))}
        </div>

        {/* Panel: Errores por Tenant */}
        {activeTab === 'errores' && (
          <div>
            <TableContainer>
              <Table>
                <TableHeadCustom table={erroresTable.table} />
                <TableBody dense={erroresTable.dense}>
                  {erroresTable.table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={!erroresTable.dense ? 'py-4 px-6' : 'px-6'}
                        >
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
                table={erroresTable.table}
                dense={erroresTable.dense}
                onChangeDense={erroresTable.onChangeDense}
              />
            </div>
          </div>
        )}

        {/* Panel: Logs del Sistema */}
        {activeTab === 'logs' && (
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/40 rounded-lg w-full" />
                ))}
              </div>
            ) : (
              <LogsFeed logs={logs} />
            )}
          </div>
        )}

        {/* Panel: Alertas Activas */}
        {activeTab === 'alertas' &&
          (isLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/40 rounded-lg w-full" />
              ))}
            </div>
          ) : alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Icon name="Bell" className="h-12 w-12 text-primary opacity-80" />
              </div>
              <h3 className="text-h6 text-foreground font-semibold mb-2">
                No hay alertas configuradas
              </h3>
              <p className="text-body2 text-muted-foreground max-w-sm mb-6">
                Configura reglas para recibir notificaciones cuando ocurran errores o eventos
                críticos en los tenants.
              </p>
              <Button color="primary" onClick={() => handleOpenAlertas()} className="gap-2">
                Configura tu primera alerta <Icon name="ArrowRight" className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <TableContainer>
                <Table>
                  <TableHeadCustom table={alertasTable.table} />
                  <TableBody dense={alertasTable.dense}>
                    {alertasTable.table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={!alertasTable.dense ? 'py-4 px-6' : 'px-6'}
                          >
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
                  table={alertasTable.table}
                  dense={alertasTable.dense}
                  onChangeDense={alertasTable.onChangeDense}
                />
              </div>
            </div>
          ))}
      </SectionCard>

      <AlertsDrawer
        alerta={selectedAlerta}
        isOpen={isAlertasOpen}
        onClose={() => setIsAlertasOpen(false)}
        onSave={handleSaveAlerta}
      />
    </PageContainer>
  );
};
