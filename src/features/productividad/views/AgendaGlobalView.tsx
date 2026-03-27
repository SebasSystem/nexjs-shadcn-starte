'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { useActividades } from '../hooks/use-actividades';
import { ActividadDrawer } from '../components/ActividadDrawer';
import { format, isToday, isPast, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  CalendarDays,
  Plus,
  MoreHorizontal,
  Check,
  User,
} from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import type { Actividad, EstadoActividad } from '../types/productividad.types';

const getEstadoIcon = (estado: EstadoActividad) => {
  switch (estado) {
    case 'PENDIENTE':
      return <Circle size={20} className="text-gray-300 hover:text-blue-500 transition-colors" />;
    case 'COMPLETADA':
      return <CheckCircle2 size={20} className="text-emerald-500" />;
    case 'VENCIDA':
      return (
        <AlertCircle size={20} className="text-red-500 hover:text-red-600 transition-colors" />
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

export const AgendaGlobalView = () => {
  const { data, isLoading, updateEstado, addActividad } = useActividades();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'Pendientes' | 'Todas' | 'Completadas'>('Pendientes');

  // Hardcoded users for now — in a real app this comes from useAuthStore / useUsers
  const usuarios = useMemo(
    () => [
      { id: '1', nombre: 'Juan Díaz' },
      { id: '2', nombre: 'María Rodríguez' },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((a) => {
      if (filterTab === 'Pendientes') return a.estado !== 'COMPLETADA';
      if (filterTab === 'Completadas') return a.estado === 'COMPLETADA';
      return true;
    });
  }, [data, filterTab]);

  const groupedData = useMemo(() => {
    const groups: Record<string, Actividad[]> = {};
    filteredData.forEach((a) => {
      const g = getRelativeDateGroup(a.fechaVencimiento, a.estado);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    });
    // Sort groups
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

  return (
    <PageContainer>
      <PageHeader
        title="Agenda & Productividad"
        subtitle="Visualiza y gestiona todas las tareas, recordatorios y reuniones de tu día a día."
        action={
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Actividad
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border hover:border-red-200 hover:shadow-sm transition p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Atrasadas</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.vencidas}</h3>
          </div>
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
        </div>
        <div className="bg-white border hover:border-blue-200 hover:shadow-sm transition p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Para hoy</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.hoy}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <CalendarDays size={24} />
          </div>
        </div>
        <div className="bg-white border hover:border-emerald-200 hover:shadow-sm transition p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completadas</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completadas}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 border-b mb-6">
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

      {isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-500 border">
          Cargando actividades...
        </div>
      ) : groupedData.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Todo al día</h3>
          <p className="text-sm text-gray-500 mb-6">No tienes actividades para este filtro.</p>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Agendar algo nuevo
          </Button>
        </div>
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
                {items.map((actividad) => (
                  <div
                    key={actividad.id}
                    className={`bg-white group p-4 rounded-xl border flex items-start gap-4 transition-all duration-200 ${
                      actividad.estado === 'COMPLETADA'
                        ? 'opacity-60 border-gray-100 hover:opacity-100'
                        : actividad.estado === 'VENCIDA' || groupName === 'Vencidas'
                          ? 'border-red-200 bg-red-50/20'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() =>
                        updateEstado(
                          actividad.id,
                          actividad.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA'
                        )
                      }
                      className="mt-1 transform hover:scale-110 active:scale-95 transition focus:outline-none"
                      title={
                        actividad.estado === 'COMPLETADA' ? 'Marcar como pendiente' : 'Completar'
                      }
                    >
                      {getEstadoIcon(actividad.estado)}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                        <div>
                          <h5
                            className={`text-[15px] leading-tight font-semibold tracking-tight ${actividad.estado === 'COMPLETADA' ? 'line-through text-gray-500' : 'text-gray-900'}`}
                          >
                            {actividad.titulo}
                          </h5>
                          {actividad.contactoNombre && (
                            <div className="text-xs text-blue-600 font-medium mt-1 truncate">
                              Empresa / Contacto: {actividad.contactoNombre}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center shrink-0">
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
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {actividad.descripcion && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {actividad.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[12px] font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                          <Clock
                            size={14}
                            className={groupName === 'Vencidas' ? 'text-red-500' : 'text-blue-500'}
                          />
                          <span
                            className={groupName === 'Vencidas' ? 'text-red-600' : 'text-gray-700'}
                          >
                            {format(new Date(actividad.fechaVencimiento), 'dd MMM yyyy', {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                          <User size={14} className="text-emerald-500" />
                          <span className="text-gray-700">{actividad.asignadoA}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <ActividadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={addActividad}
        usuarios={usuarios}
      />
    </PageContainer>
  );
};
