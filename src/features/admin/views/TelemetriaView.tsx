'use client';

import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { useTelemetria } from 'src/features/admin/hooks/use-telemetria';
import { Button } from 'src/shared/components/ui/button';
import {
  Settings,
  CheckCircle2,
  AlertOctagon,
  Building2,
  Zap,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'src/shared/components/ui/tabs';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { LogsFeed } from 'src/features/admin/components/telemetria/logs-feed';
import { AlertasDrawer } from 'src/features/admin/components/telemetria/alertas-drawer';
import { Badge } from 'src/shared/components/ui/badge';
import { Switch } from 'src/shared/components/ui/switch';
import { TenantStatusBadge } from 'src/features/admin/components/tenants/tenant-status-badge';

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

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const TelemetriaView = () => {
  const { logs, alertas, isLoading, toggleAlerta, updateAlerta, saveAlerta } = useTelemetria();

  const [isAlertasOpen, setIsAlertasOpen] = useState(false);
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

  return (
    <PageContainer>
      <PageHeader
        title="Telemetría Global"
        subtitle="Monitoreo de errores y salud del sistema por tenant"
        action={
          <Button onClick={() => handleOpenAlertas()} className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar Alertas
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Uptime Global"
          value="99.94%"
          trend="SLA: 99.9%"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Errores 24h"
          value="143"
          trend="-22% vs ayer"
          trendUp={false}
          icon={<AlertOctagon className="h-5 w-5" />}
          iconClassName="bg-red-500/10 text-red-600"
        />
        <StatsCard
          title="Tenants con errores"
          value="8"
          trend="5 críticos"
          icon={<Building2 className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Latencia P95"
          value="240ms"
          trend="↑ +30ms vs ayer"
          trendUp={false}
          icon={<Zap className="h-5 w-5" />}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
      </div>

      <SectionCard noPadding className="flex-1 flex flex-col min-h-[500px]">
        <Tabs defaultValue="errores" className="w-full flex flex-col h-full">
          <div className="px-6 border-b border-border/40">
            <TabsList className="bg-transparent h-14 p-0">
              <TabsTrigger
                value="errores"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4 font-medium"
              >
                Errores por Tenant
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4 font-medium"
              >
                Logs del Sistema
              </TabsTrigger>
              <TabsTrigger
                value="alertas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4 font-medium"
              >
                Alertas Activas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="errores" className="p-0 flex-1 outline-none mt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[22%]">
                      Tenant
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[12%]">
                      Errores 24h
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[18%]">
                      Tipo más frecuente
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[14%]">
                      Último error
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[12%]">
                      Severidad
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[10%]">
                      Estado
                    </th>
                    <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground w-[12%]">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TENANT_ERRORS.map((t) => (
                    <tr key={t.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                              {getInitials(t.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground text-sm">{t.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-semibold ${t.errores > 50 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full' : 'text-foreground'}`}
                        >
                          {t.errores}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{t.tipo}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{t.time}</td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`
                          ${
                            t.severidad === 'CRITICO'
                              ? 'bg-red-100 text-red-700 border-transparent'
                              : t.severidad === 'ALTO'
                                ? 'bg-amber-100 text-amber-700 border-transparent'
                                : t.severidad === 'MEDIO'
                                  ? 'bg-orange-100 text-orange-700 border-transparent'
                                  : 'bg-gray-100 text-gray-500 border-transparent'
                          }
                        `}
                        >
                          {t.severidad}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <TenantStatusBadge
                          estado={t.estado as 'ACTIVO' | 'TRIAL' | 'VENCIDO' | 'SUSPENDIDO'}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 font-medium h-8 hover:bg-blue-50"
                        >
                          Ver logs <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="p-6 outline-none mt-0">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/40 rounded-lg w-full" />
                ))}
              </div>
            ) : (
              <LogsFeed logs={logs} />
            )}
          </TabsContent>

          <TabsContent value="alertas" className="p-0 outline-none mt-0">
            {isLoading ? (
              <div className="p-6 space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-lg w-full" />
                ))}
              </div>
            ) : alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Bell className="h-12 w-12 text-primary opacity-80" />
                </div>
                <h3 className="text-h6 text-foreground font-semibold mb-2">
                  No hay alertas configuradas
                </h3>
                <p className="text-body2 text-muted-foreground max-w-sm mb-6">
                  Configura reglas para recibir notificaciones cuando ocurran errores o eventos
                  críticos en los tenants.
                </p>
                <Button onClick={() => handleOpenAlertas()} className="gap-2">
                  Configura tu primera alerta <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Alerta
                      </th>
                      <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Condición
                      </th>
                      <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Canal
                      </th>
                      <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Estado
                      </th>
                      <th className="text-left py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Última activación
                      </th>
                      <th className="text-right py-3 px-6 text-caption font-semibold text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertas.map((a) => (
                      <tr key={a.id} className="border-b border-border/20 hover:bg-muted/30">
                        <td className="py-4 px-6 font-medium text-foreground">{a.nombre}</td>
                        <td className="py-4 px-6 text-muted-foreground">{a.condicion}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-1.5 flex-wrap">
                            {a.canal.map((c) => (
                              <Badge key={c} variant="outline" className="text-[10px] bg-card">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={a.estado === 'ACTIVO'}
                              onCheckedChange={() => toggleAlerta(a.id)}
                            />
                            <span className="text-xs text-muted-foreground">
                              {a.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                          {a.ultimaActivacion
                            ? new Date(a.ultimaActivacion).toLocaleDateString('es-MX')
                            : 'Nunca'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenAlertas(a)}>
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SectionCard>

      <AlertasDrawer
        alerta={selectedAlerta}
        isOpen={isAlertasOpen}
        onClose={() => setIsAlertasOpen(false)}
        onSave={handleSaveAlerta}
      />
    </PageContainer>
  );
};
