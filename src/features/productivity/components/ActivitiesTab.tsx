'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState } from 'react';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Textarea } from 'src/shared/components/ui/textarea';

import { useActivities } from '../hooks/use-activities';
import type { ActivityStatus, ActivityType } from '../types/productivity.types';

export const ActivitiesTab = ({
  contactoId,
  contactoNombre,
}: {
  contactoId: string;
  contactoNombre: string;
}) => {
  const { data, isLoading, addActivity, updateStatus } = useActivities(contactoId);
  const [type, setType] = useState<ActivityType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !dueDate) return;
    setIsSubmitting(true);
    const success = await addActivity({
      contact_uid: contactoId,
      contact_name: contactoNombre,
      type,
      title,
      description,
      due_date: new Date(dueDate).toISOString(),
    });
    setIsSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setType('task');
    }
  };

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case 'pending':
        return <Icon name="Circle" size={16} className="text-blue-500" />;
      case 'in_progress':
        return <Icon name="Loader2" size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <Icon name="CheckCircle2" size={16} className="text-emerald-500" />;
      case 'cancelled':
        return <Icon name="XCircle" size={16} className="text-gray-400" />;
      case 'overdue':
        return <Icon name="AlertCircle" size={16} className="text-red-500" />;
      default:
        return <Icon name="Circle" size={16} className="text-blue-500" />;
    }
  };

  const activityTypeLabel =
    type === 'task'
      ? 'tarea'
      : type === 'reminder'
        ? 'recordatorio'
        : type === 'meeting'
          ? 'reunión'
          : type === 'call'
            ? 'llamada'
            : type === 'email'
              ? 'correo'
              : 'nota';

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
                { value: 'task', label: 'Tarea' },
                { value: 'call', label: 'Llamada' },
                { value: 'meeting', label: 'Reunión' },
                { value: 'email', label: 'Correo' },
                { value: 'note', label: 'Nota' },
                { value: 'reminder', label: 'Recordatorio' },
              ]}
              value={type}
              onChange={(v) => setType(v as ActivityType)}
            />
            <Input
              label="Fecha"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Input
            placeholder="Título de la actividad"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm font-medium"
          />
          <Textarea
            placeholder="Notas adicionales (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm min-h-[60px] resize-none"
          />
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isSubmitting || !title.trim() || !dueDate}
              className="text-xs h-8"
            >
              Agendar {activityTypeLabel}
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
            {data.map((activity) => (
              <div
                key={activity.uid}
                className={`bg-white p-4 rounded-lg border flex items-start gap-3 transition-colors ${
                  activity.status === 'completed'
                    ? 'opacity-60 border-gray-100'
                    : activity.status === 'overdue'
                      ? 'border-red-200'
                      : 'border-blue-100'
                }`}
              >
                <button
                  onClick={() =>
                    updateStatus(
                      activity.uid,
                      activity.status === 'completed' ? 'pending' : 'completed'
                    )
                  }
                  className="mt-0.5 hover:scale-110 transition-transform focus:outline-none"
                >
                  {getStatusIcon(activity.status)}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h5
                      className={`text-sm font-medium tracking-tight ${
                        activity.status === 'completed'
                          ? 'line-through text-gray-500'
                          : 'text-gray-900'
                      }`}
                    >
                      {activity.title}
                    </h5>
                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                      {activity.type === 'task'
                        ? 'Tarea'
                        : activity.type === 'reminder'
                          ? 'Recordatorio'
                          : activity.type === 'meeting'
                            ? 'Reunión'
                            : activity.type === 'call'
                              ? 'Llamada'
                              : activity.type === 'email'
                                ? 'Correo'
                                : 'Nota'}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <Icon
                        name="Clock"
                        size={12}
                        className={activity.status === 'overdue' ? 'text-red-500' : ''}
                      />
                      <span className={activity.status === 'overdue' ? 'text-red-500' : ''}>
                        {format(new Date(activity.due_date), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </span>
                    </div>
                    <span>•</span>
                    <span>Asignado: {activity.assigned_to_name}</span>
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
