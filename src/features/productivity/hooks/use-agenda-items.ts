'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { isPast, isToday } from 'date-fns';
import { ProductivityService } from '../services/productivity.service';
import { MOCK_OPPORTUNITIES } from 'src/_mock/_sales';
import { MOCK_PROJECTS } from 'src/_mock/_projects';
import type { Actividad, EstadoActividad } from '../types/productivity.types';
import { toast } from 'sonner';

// ─── Map pipeline activity type → TipoActividad ──────────────────────────────

const PIPELINE_TYPE_MAP: Record<string, Actividad['tipo']> = {
  llamada: 'TAREA',
  email: 'TAREA',
  reunion: 'REUNION',
  demo: 'REUNION',
  seguimiento: 'RECORDATORIO',
};

// ─── Map milestone status → EstadoActividad ──────────────────────────────────

function milestoneEstado(status: string, dueDate: string): EstadoActividad {
  if (status === 'completed') return 'COMPLETADA';
  if (status === 'delayed') return 'VENCIDA';
  const d = new Date(dueDate);
  if (isPast(d) && !isToday(d)) return 'VENCIDA';
  return 'PENDIENTE';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgendaItems() {
  const [manualItems, setManualItems] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchManual = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await ProductivityService.getActividades();
      // Mark manually created items with source = 'agenda'
      setManualItems(items.map((a) => ({ ...a, source: a.source ?? ('agenda' as const) })));
    } catch {
      toast.error('Error al cargar actividades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManual();
  }, [fetchManual]);

  // ─── Pipeline items ───────────────────────────────────────────────────────
  const pipelineItems = useMemo((): Actividad[] => {
    const items: Actividad[] = [];
    MOCK_OPPORTUNITIES.forEach((opp) => {
      if (opp.stage === 'cerrado') return;
      opp.activities.forEach((act) => {
        if (act.status === 'cancelada') return;
        const estado: EstadoActividad =
          act.status === 'completada'
            ? 'COMPLETADA'
            : isPast(new Date(act.date)) && !isToday(new Date(act.date))
              ? 'VENCIDA'
              : 'PENDIENTE';
        items.push({
          id: `pipeline-${act.id}`,
          tipo: PIPELINE_TYPE_MAP[act.type] ?? 'TAREA',
          titulo: `${act.type.charAt(0).toUpperCase() + act.type.slice(1)} — ${opp.clientName}`,
          descripcion: act.notes,
          estado,
          fechaVencimiento: act.date,
          asignadoA: act.responsible,
          contactoNombre: opp.clientName,
          source: 'pipeline',
          sourceId: opp.id,
          sourcePath: '/sales/pipeline',
          sourceLabel: opp.clientName,
        });
      });
    });
    return items;
  }, []);

  // ─── Project milestone items ──────────────────────────────────────────────
  const projectItems = useMemo((): Actividad[] => {
    const items: Actividad[] = [];
    MOCK_PROJECTS.forEach((project) => {
      if (project.status === 'cancelled' || project.status === 'completed') return;
      project.milestones.forEach((milestone) => {
        items.push({
          id: `project-${milestone.id}`,
          tipo: 'TAREA',
          titulo: milestone.name,
          descripcion: milestone.description,
          estado: milestoneEstado(milestone.status, milestone.dueDate),
          fechaVencimiento: milestone.dueDate,
          asignadoA: milestone.assignedTo,
          contactoNombre: project.clientName,
          source: 'project',
          sourceId: project.id,
          sourcePath: `/projects/${project.id}`,
          sourceLabel: project.name,
        });
      });
    });
    return items;
  }, []);

  // ─── Unified list ─────────────────────────────────────────────────────────
  const allItems = useMemo(
    () => [...manualItems, ...pipelineItems, ...projectItems],
    [manualItems, pipelineItems, projectItems]
  );

  // ─── Update estado (only manual items) ───────────────────────────────────
  const updateEstado = async (id: string, estado: EstadoActividad) => {
    // Pipeline and project items can't be updated from Agenda — they're read-only projections
    if (id.startsWith('pipeline-') || id.startsWith('project-')) {
      toast.info('Para actualizar este item, andá a la fuente original.');
      return;
    }
    try {
      await ProductivityService.updateActividadEstado(id, estado);
      await fetchManual();
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error actualizando estado');
    }
  };

  const addActividad = async (payload: Omit<Actividad, 'id' | 'estado'>) => {
    try {
      const { asignadoA: _a, ...rest } = payload;
      await ProductivityService.createActividad(rest);
      await fetchManual();
      toast.success('Actividad agendada');
      return true;
    } catch {
      toast.error('Error al agendar actividad');
      return false;
    }
  };

  return {
    data: allItems,
    isLoading,
    updateEstado,
    addActividad,
  };
}
