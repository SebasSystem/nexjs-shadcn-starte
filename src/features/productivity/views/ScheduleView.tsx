'use client';

import { format, isPast, isThisWeek, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { ActivityDrawer } from '../components/ActivityDrawer';
import { useAgendaItems } from '../hooks/use-agenda-items';
import type { Actividad, ActividadSource, EstadoActividad } from '../types/productivity.types';

// ─── Source badge config ──────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<ActividadSource, { label: string; className: string } | undefined> = {
  pipeline: {
    label: 'Pipeline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  project: {
    label: 'Proyecto',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  agenda: undefined, // no badge for manually created items
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEstadoIcon = (estado: EstadoActividad) => {
  switch (estado) {
    case 'PENDIENTE':
      return (
        <Icon
          name="Circle"
          size={20}
          className="text-gray-300 hover:text-blue-500 transition-colors"
        />
      );
    case 'COMPLETADA':
      return <Icon name="CheckCircle2" size={20} className="text-emerald-500" />;
    case 'VENCIDA':
      return (
        <Icon
          name="AlertCircle"
          size={20}
          className="text-red-500 hover:text-red-600 transition-colors"
        />
      );
  }
};

const getRelativeDateGroup = (dateStr: string, estado: EstadoActividad) => {
  if (estado === 'COMPLETADA') return 'Completadas';
  const d = new Date(dateStr);
  if (isPast(d) && !isToday(d)) return 'Vencidas';
  if (isToday(d)) return 'Para Hoy';
  if (isTomorrow(d)) return 'Para Mañana';
  if (isThisWeek(d)) return 'Esta Semana';
  return 'Próximamente';
};

const GROUP_ORDERS = {
  Vencidas: 0,
  'Para Hoy': 1,
  'Para Mañana': 2,
  'Esta Semana': 3,
  Próximamente: 4,
  Completadas: 5,
};

// ─── View ─────────────────────────────────────────────────────────────────────

export const ScheduleView = () => {
  const router = useRouter();
  const { data, isLoading, updateEstado, addActividad } = useAgendaItems();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'Pendientes' | 'Todas' | 'Completadas'>('Pendientes');
  const [filterSource, setFilterSource] = useState<'all' | ActividadSource>('all');

  const usuarios = useMemo(
    () => [
      { id: '1', nombre: 'Juan Díaz' },
      { id: '2', nombre: 'María Rodríguez' },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((a) => {
      const matchTab =
        filterTab === 'Pendientes'
          ? a.estado !== 'COMPLETADA'
          : filterTab === 'Completadas'
            ? a.estado === 'COMPLETADA'
            : true;
      const matchSource = filterSource === 'all' || a.source === filterSource;
      return matchTab && matchSource;
    });
  }, [data, filterTab, filterSource]);

  const groupedData = useMemo(() => {
    const groups: Record<string, Actividad[]> = {};
    filteredData.forEach((a) => {
      const g = getRelativeDateGroup(a.fechaVencimiento, a.estado);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    });
    return Object.entries(groups).sort(
      (a, b) =>
        GROUP_ORDERS[a[0] as keyof typeof GROUP_ORDERS] -
        GROUP_ORDERS[b[0] as keyof typeof GROUP_ORDERS]
    );
  }, [filteredData]);

  const stats = useMemo(
    () => ({
      vencidas: data.filter(
        (a) =>
          a.estado === 'VENCIDA' ||
          (isPast(new Date(a.fechaVencimiento)) &&
            !isToday(new Date(a.fechaVencimiento)) &&
            a.estado !== 'COMPLETADA')
      ).length,
      hoy: data.filter((a) => isToday(new Date(a.fechaVencimiento)) && a.estado !== 'COMPLETADA')
        .length,
      completadas: data.filter((a) => a.estado === 'COMPLETADA').length,
    }),
    [data]
  );

  const sourceFilterOptions: { value: 'all' | ActividadSource; label: string }[] = [
    { value: 'all', label: 'Todas las fuentes' },
    { value: 'agenda', label: 'Agenda manual' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'project', label: 'Proyectos' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Agenda & Productividad"
        subtitle="Tareas, hitos y reuniones del pipeline y proyectos, todo en un solo lugar."
        action={
          <Button color="primary" onClick={() => setIsDrawerOpen(true)} className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Nueva Actividad
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SectionCard className="hover:border-red-200 hover:shadow-sm transition flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Atrasadas</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.vencidas}</h3>
          </div>
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <Icon name="AlertCircle" size={24} />
          </div>
        </SectionCard>
        <SectionCard className="hover:border-blue-200 hover:shadow-sm transition flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Para hoy</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.hoy}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Icon name="CalendarDays" size={24} />
          </div>
        </SectionCard>
        <SectionCard className="hover:border-emerald-200 hover:shadow-sm transition flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completadas</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completadas}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <Icon name="CheckCircle2" size={24} />
          </div>
        </SectionCard>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex items-center gap-1 border-b">
          {(['Pendientes', 'Completadas', 'Todas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filterTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Source filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {sourceFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterSource(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterSource === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SectionCard className="p-10 text-center text-sm text-gray-500">
          Cargando actividades...
        </SectionCard>
      ) : groupedData.length === 0 ? (
        <SectionCard className="p-16 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <Icon name="Check" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Todo al día</h3>
          <p className="text-sm text-gray-500 mb-6">No hay actividades para este filtro.</p>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Agendar algo nuevo
          </Button>
        </SectionCard>
      ) : (
        <div className="space-y-8">
          {groupedData.map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <h4
                className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                  groupName === 'Vencidas'
                    ? 'text-red-500'
                    : groupName === 'Para Hoy'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                }`}
              >
                {groupName}{' '}
                <span className="bg-gray-100/50 text-gray-400 px-2 py-0.5 rounded-full text-[11px] border border-gray-200/50">
                  {items.length}
                </span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {items.map((actividad) => {
                  const sourceCfg = actividad.source ? SOURCE_CONFIG[actividad.source] : undefined;
                  const isReadOnly =
                    actividad.source === 'pipeline' || actividad.source === 'project';

                  return (
                    <SectionCard
                      key={actividad.id}
                      className={`group flex items-start gap-4 transition-all duration-200 cursor-default ${
                        actividad.estado === 'COMPLETADA'
                          ? 'opacity-60 hover:opacity-100'
                          : actividad.estado === 'VENCIDA' || groupName === 'Vencidas'
                            ? 'border-red-200 bg-red-50/20 dark:bg-red-500/5'
                            : 'hover:border-primary/40 hover:shadow-md'
                      }`}
                    >
                      {/* Toggle button — disabled for read-only items */}
                      <button
                        onClick={() =>
                          !isReadOnly &&
                          updateEstado(
                            actividad.id,
                            actividad.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA'
                          )
                        }
                        disabled={isReadOnly}
                        className={`mt-1 transform transition focus:outline-none shrink-0 ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:scale-110 active:scale-95'
                        }`}
                        title={
                          isReadOnly
                            ? 'Actualizá el estado en la fuente original'
                            : actividad.estado === 'COMPLETADA'
                              ? 'Marcar como pendiente'
                              : 'Completar'
                        }
                      >
                        {getEstadoIcon(actividad.estado)}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <div>
                            <h5
                              className={`text-[15px] leading-tight font-semibold tracking-tight ${
                                actividad.estado === 'COMPLETADA'
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {actividad.titulo}
                            </h5>
                            {actividad.contactoNombre && (
                              <div className="text-xs text-primary font-medium mt-1 truncate">
                                {actividad.source === 'project'
                                  ? `Proyecto: ${actividad.sourceLabel}`
                                  : `Cliente: ${actividad.contactoNombre}`}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 items-center shrink-0">
                            {/* Source badge */}
                            {sourceCfg && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 ${sourceCfg.className}`}
                              >
                                {sourceCfg.label}
                              </Badge>
                            )}

                            {/* Activity type badge */}
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                                actividad.tipo === 'REUNION'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : actividad.tipo === 'RECORDATORIO'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {actividad.tipo}
                            </Badge>

                            {/* Actions: redirect or more options */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {actividad.sourcePath ? (
                                <button
                                  onClick={() => router.push(actividad.sourcePath!)}
                                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px] font-medium"
                                  title="Ir a la fuente"
                                >
                                  Ver
                                  <Icon name="ArrowRight" size={12} />
                                </button>
                              ) : (
                                <button className="p-1 hover:bg-muted rounded text-muted-foreground">
                                  <Icon name="MoreHorizontal" size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {actividad.descripcion && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {actividad.descripcion}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[12px] font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-md border border-border/50">
                            <Icon
                              name="Clock"
                              size={14}
                              className={groupName === 'Vencidas' ? 'text-red-500' : 'text-primary'}
                            />
                            <span
                              className={
                                groupName === 'Vencidas' ? 'text-red-600' : 'text-foreground'
                              }
                            >
                              {format(new Date(actividad.fechaVencimiento), 'dd MMM yyyy', {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-md border border-border/50">
                            <Icon name="User" size={14} className="text-emerald-500" />
                            <span className="text-foreground">{actividad.asignadoA}</span>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <ActivityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={addActividad}
        usuarios={usuarios}
      />
    </PageContainer>
  );
};
