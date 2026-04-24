'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon, type IconName } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { Textarea } from 'src/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/shared/components/ui/dialog';
import { useSalesContext } from '../context/SalesContext';
import type { Opportunity, ActivityType } from 'src/features/sales/types/sales.types';
import { cn } from 'src/lib/utils';
import { SelectField } from 'src/shared/components/ui/select-field';

interface OpportunityTimelineProps {
  opportunity: Opportunity;
}

const ACTIVITY_ICONS: Record<ActivityType | 'nota', IconName> = {
  llamada: 'Phone',
  email: 'Mail',
  reunion: 'CalendarDays',
  demo: 'CalendarDays',
  seguimiento: 'CalendarDays',
  nota: 'MessageSquare',
};

export function OpportunityTimeline({ opportunity }: OpportunityTimelineProps) {
  const {
    addNoteToOpportunity,
    addActivityToOpportunity,
    updateNoteInOpportunity,
    removeNoteFromOpportunity,
    updateActivityInOpportunity,
    removeActivityFromOpportunity,
  } = useSalesContext();
  const [activeTab, setActiveTab] = useState<'nota' | 'actividad'>('nota');
  const [newNote, setNewNote] = useState('');

  const [newActivity, setNewActivity] = useState({
    type: 'llamada' as ActivityType,
    date: '',
    notes: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: ActivityType | 'nota' } | null>(
    null
  );

  const startEdit = (id: string, content: string | undefined) => {
    setEditingId(id);
    setEditingContent(content || '');
  };

  const handleUpdate = (item: { id: string; type: ActivityType | 'nota' }) => {
    if (!editingContent.trim() && item.type === 'nota') return;

    if (item.type === 'nota') {
      updateNoteInOpportunity(opportunity.id, item.id, editingContent.trim());
    } else {
      updateActivityInOpportunity(opportunity.id, item.id, {
        notes: editingContent.trim() || undefined,
      });
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'nota') {
        removeNoteFromOpportunity(opportunity.id, deleteItem.id);
      } else {
        removeActivityFromOpportunity(opportunity.id, deleteItem.id);
      }
      setDeleteItem(null);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteToOpportunity(opportunity.id, {
      content: newNote.trim(),
      author: 'Admin', // Usuario logueado (mock)
    });
    setNewNote('');
  };

  const handleAddActivity = () => {
    if (!newActivity.date) return;
    addActivityToOpportunity(opportunity.id, {
      type: newActivity.type,
      date: new Date(newActivity.date).toISOString(),
      responsible: 'Admin',
      status: 'pendiente',
      notes: newActivity.notes.trim() || undefined,
    });
    setNewActivity({ type: 'llamada', date: '', notes: '' });
  };

  // Mezclar y ordenar notas y actividades
  const timelineItems = [
    ...opportunity.notes.map((n) => ({
      id: n.id,
      date: new Date(n.createdAt),
      type: 'nota' as const,
      content: n.content,
      author: n.author,
    })),
    ...opportunity.activities.map((a) => ({
      id: a.id,
      date: new Date(a.date),
      type: a.type as ActivityType | 'nota',
      content: a.notes,
      author: a.responsible,
      status: a.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      {/* ── Acciones de creacion ────────────────────────────────────────────── */}
      <div className="bg-muted/10 p-5 border-b border-border/40">
        <div className="flex items-center gap-1 mb-4 border-b border-border/40 pb-2">
          <button
            onClick={() => setActiveTab('nota')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
              activeTab === 'nota'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Nueva Nota
          </button>
          <button
            onClick={() => setActiveTab('actividad')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
              activeTab === 'actividad'
                ? 'border-indigo-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Registrar Actividad
          </button>
        </div>

        {activeTab === 'nota' ? (
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="Escribe una nota sobre esta oportunidad..."
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-background"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Guardar Nota
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                options={[
                  { value: 'llamada', label: 'Llamada' },
                  { value: 'email', label: 'Email' },
                  { value: 'reunion', label: 'Reunión' },
                  { value: 'demo', label: 'Demostración' },
                  { value: 'seguimiento', label: 'Seguimiento' },
                ]}
                value={newActivity.type}
                onChange={(v) => setNewActivity((p) => ({ ...p, type: v as ActivityType }))}
              />
              <input
                type="datetime-local"
                className="w-full h-10 px-3 text-sm bg-background border border-border/50 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={newActivity.date}
                onChange={(e) => setNewActivity((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Resumen o detalles de la actividad..."
              rows={2}
              value={newActivity.notes}
              onChange={(e) => setNewActivity((p) => ({ ...p, notes: e.target.value }))}
              className="bg-background"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                color="primary"
                onClick={handleAddActivity}
                disabled={!newActivity.date}
              >
                Programar Actividad
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Lista Timeline ──────────────────────────────────────────────────── */}
      <div className="p-6">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
          Historial y Seguimiento
        </h3>

        {timelineItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay historial aún.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:top-0 before:bottom-0 before:left-5 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
            {timelineItems.map((item) => {
              const activityIcon = ACTIVITY_ICONS[item.type] ?? 'Mail';
              const isNote = item.type === 'nota';

              return (
                <div key={item.id} className="relative flex items-start gap-4 group">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 shadow-sm z-10 mt-1',
                      isNote ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-500'
                    )}
                  >
                    {'status' in item && (item as { status?: string }).status === 'completada' ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      <Icon name={activityIcon} size={16} />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-muted/10 p-4 rounded-xl border border-border/40 shadow-sm hover:border-indigo-500/30 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {item.type}{' '}
                          {'status' in item && (item as { status?: string }).status
                            ? `• ${(item as { status?: string }).status}`
                            : ''}
                        </span>
                        <time className="text-[10px] text-muted-foreground font-mono">
                          {format(item.date, 'd MMM, HH:mm', { locale: es })}
                        </time>
                      </div>

                      {/* Actions on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(item.id, item.content)}
                          className="p-1 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Icon name="Edit2" size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteItem({ id: item.id, type: item.type })}
                          className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Icon name="Trash2" size={12} />
                        </button>
                      </div>
                    </div>

                    {editingId === item.id ? (
                      <div className="mt-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="bg-background min-h-[80px] text-sm"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="h-7 text-xs px-2"
                          >
                            <Icon name="X" size={12} className="mr-1" /> Cancelar
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleUpdate(item)}
                            className="h-7 text-xs px-2"
                          >
                            <Icon name="Check" size={12} className="mr-1" /> Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.content && (
                          <p className="text-sm text-foreground/80 leading-relaxed mb-2 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        )}
                        <span className="text-xs font-medium text-foreground/60">
                          Por {item.author}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmación Eliminar Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro del historial? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancelar
            </Button>
            <Button color="error" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
