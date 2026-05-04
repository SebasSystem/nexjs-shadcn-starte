'use client';

import { useMemo, useState } from 'react';
import { AlertasTable } from 'src/features/admin/components/alertas-table';
import { AlertsDrawer } from 'src/features/admin/components/alerts-drawer';
import { LogsFeed } from 'src/features/admin/components/logs-feed';
import type { TenantErrorRow } from 'src/features/admin/components/tenant-errors-table';
import { TenantErrorsTable } from 'src/features/admin/components/tenant-errors-table';
import { useTelemetry } from 'src/features/admin/hooks/use-telemetry';
import type { Alerta } from 'src/features/admin/types/admin.types';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

const SEVERIDAD_ORDER: Record<string, number> = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };

export const TelemetryView = () => {
  const { logs, alertas, stats, isLoading, toggleAlerta, updateAlerta, saveAlerta } =
    useTelemetry();

  const [isAlertasOpen, setIsAlertasOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'errores' | 'logs' | 'alertas'>('errores');
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);

  const handleOpenAlertas = (alerta: Alerta | null = null) => {
    setSelectedAlerta(alerta);
    setIsAlertasOpen(true);
  };

  const handleSaveAlerta = async (data: Omit<Alerta, 'uid'>) => {
    if (selectedAlerta) {
      await updateAlerta(selectedAlerta.uid, data);
    } else {
      await saveAlerta(data);
    }
  };

  const tenantErrors = useMemo<TenantErrorRow[]>(() => {
    const byTenant = new Map<string, TenantErrorRow>();
    for (const log of logs) {
      const existing = byTenant.get(log.tenant_uid);
      const currentSev = log.severity ?? 'BAJO';
      const existingSev = existing?.severity ?? 'BAJO';
      const isMoreSevere = (SEVERIDAD_ORDER[currentSev] ?? 3) < (SEVERIDAD_ORDER[existingSev] ?? 3);
      if (!existing || isMoreSevere) {
        byTenant.set(log.tenant_uid, {
          tenantId: log.tenant_uid,
          nombre: log.tenant_nombre,
          errores: log.errors_last_24h ?? 0,
          tipo: log.message,
          timestamp: log.timestamp,
          severity: log.severity ?? 'BAJO',
        });
      }
    }
    return Array.from(byTenant.values()).sort(
      (a, b) =>
        (SEVERIDAD_ORDER[a.severity ?? 'BAJO'] ?? 3) - (SEVERIDAD_ORDER[b.severity ?? 'BAJO'] ?? 3)
    );
  }, [logs]);

  const errores24hTotal = useMemo(() => logs.filter((l) => l.level === 'ERROR').length, [logs]);
  const tenantsConErrores = useMemo(
    () => new Set(logs.filter((l) => l.level === 'ERROR').map((l) => l.tenant_uid)).size,
    [logs]
  );

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
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <StatsCard
              title="Uptime Global"
              value={`${stats.uptime_global_percent}%`}
              trend="últimas 24h"
              icon={<Icon name="CheckCircle2" className="h-5 w-5" />}
              iconClassName="bg-emerald-500/10 text-emerald-600"
            />
            <StatsCard
              title="Errores 24h"
              value={stats.errores_24h > 0 ? stats.errores_24h : errores24hTotal}
              trend="nivel ERROR en logs"
              trendUp={false}
              icon={<Icon name="AlertOctagon" className="h-5 w-5" />}
              iconClassName="bg-red-500/10 text-red-600"
            />
            <StatsCard
              title="Tenants con errores"
              value={stats.tenants_with_errors || tenantsConErrores}
              trend="con nivel ERROR"
              icon={<Icon name="Building2" className="h-5 w-5" />}
              iconClassName="bg-amber-500/10 text-amber-600"
            />
            <StatsCard
              title="Latencia P95"
              value={stats.latencia_p95_ms != null ? `${stats.latencia_p95_ms}ms` : '—'}
              trend={stats.latencia_p95_ms != null ? 'p95' : 'Pendiente de backend'}
              trendUp={false}
              icon={<Icon name="Zap" className="h-5 w-5" />}
              iconClassName="bg-purple-500/10 text-purple-600"
            />
          </>
        )}
      </div>

      <SectionCard noPadding className="flex flex-col">
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

        {activeTab === 'errores' && <TenantErrorsTable data={tenantErrors} isLoading={isLoading} />}

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

        {activeTab === 'alertas' && (
          <AlertasTable
            data={alertas}
            isLoading={isLoading}
            onEdit={handleOpenAlertas}
            onToggle={toggleAlerta}
            onNewAlerta={() => handleOpenAlertas()}
          />
        )}
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
