'use client';

import React, { useState } from 'react';
import { useActivities } from '../hooks/use-activities';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Icon } from 'src/shared/components/ui/icon';
import type { TipoActividad, EstadoActividad } from '../types/productivity.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActivitiesTab = ({
  contactoId,
  contactoNombre,
}: {
  contactoId: string;
  contactoNombre: string;
}) => {
  const { data, isLoading, isSubmitting, addActividad, updateEstado } = useActivities(contactoId);
  const [tipo, setTipo] = useState<TipoActividad>('TAREA');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');

  const handleCreate = async () => {
    if (!titulo.trim() || !fecha) return;
    const success = await addActividad({
      contactoId,
      contactoNombre,
      tipo,
      titulo,
      descripcion,
      fechaVencimiento: new Date(fecha).toISOString(),
    });
    if (success) {
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setTipo('TAREA');
    }
  };

  const getEstadoIcon = (estado: EstadoActividad) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Icon name="Circle" size={16} className="text-blue-500" />;
      case 'COMPLETADA':
        return <Icon name="CheckCircle2" size={16} className="text-emerald-500" />;
      case 'VENCIDA':
        return <Icon name="AlertCircle" size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm rounded-t-xl mx-4 mt-4 mb-2 border">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Icon name="CalendarDays" size={16} className="text-blue-600" />
          Agendar nueva actividad
        </h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Tipo"
              options={[
                { value: 'TAREA', label: 'Tarea' },
                { value: 'RECORDATORIO', label: 'Recordatorio' },
                { value: 'REUNION', label: 'Reunión' },
              ]}
              value={tipo}
              onChange={(v) => setTipo(v as TipoActividad)}
            />
            <Input
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <Input
            placeholder="Título de la actividad"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="h-9 text-sm font-medium"
          />
          <Textarea
            placeholder="Notas adicionales (opcional)..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="text-sm min-h-[60px] resize-none"
          />
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isSubmitting || !titulo.trim() || !fecha}
              className="text-xs h-8"
            >
              Agendar {tipo.toLowerCase()}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="text-center text-sm text-gray-400 mt-10">Cargando agenda...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-10">Sin actividades agendadas.</div>
        ) : (
          <div className="space-y-3">
            {data.map((actividad) => (
              <div
                key={actividad.id}
                className={`bg-white p-4 rounded-lg border flex items-start gap-3 transition-colors ${
                  actividad.estado === 'COMPLETADA'
                    ? 'opacity-60 border-gray-100'
                    : actividad.estado === 'VENCIDA'
                      ? 'border-red-200'
                      : 'border-blue-100'
                }`}
              >
                <button
                  onClick={() =>
                    updateEstado(
                      actividad.id,
                      actividad.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA'
                    )
                  }
                  className="mt-0.5 hover:scale-110 transition-transform focus:outline-none"
                >
                  {getEstadoIcon(actividad.estado)}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h5
                      className={`text-sm font-medium tracking-tight ${actividad.estado === 'COMPLETADA' ? 'line-through text-gray-500' : 'text-gray-900'}`}
                    >
                      {actividad.titulo}
                    </h5>
                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                      {actividad.tipo}
                    </span>
                  </div>
                  {actividad.descripcion && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {actividad.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <Icon
                        name="Clock"
                        size={12}
                        className={actividad.estado === 'VENCIDA' ? 'text-red-500' : ''}
                      />
                      <span className={actividad.estado === 'VENCIDA' ? 'text-red-500' : ''}>
                        {format(new Date(actividad.fechaVencimiento), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </span>
                    </div>
                    <span>•</span>
                    <span>Asignado: {actividad.asignadoA}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
