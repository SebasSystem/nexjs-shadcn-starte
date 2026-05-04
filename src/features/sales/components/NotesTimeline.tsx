'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from 'src/shared/components/ui/button';
import { Card, CardContent } from 'src/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/shared/components/ui/dialog';
import { Icon } from 'src/shared/components/ui/icon';
import { Textarea } from 'src/shared/components/ui/textarea';

import { useSalesContext } from '../context/SalesContext';

interface NotesTimelineProps {
  opportunityId?: string;
}

export function NotesTimeline({ opportunityId }: NotesTimelineProps) {
  const {
    opportunities,
    addNoteToOpportunity,
    updateNoteInOpportunity,
    removeNoteFromOpportunity,
  } = useSalesContext();

  const opp = opportunities.find((o) => o.id === opportunityId);

  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Opcional: filtro de fecha (simplificado a mes actual, todos, etc, o solo un input de texto para buscar)
  const [searchTerm, setSearchTerm] = useState('');

  if (!opp) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteToOpportunity(opp.id, {
      content: newNote.trim(),
      author: 'Admin', // Usuario logueado (mock)
    });
    setNewNote('');
  };

  const startEdit = (id: string, content: string) => {
    setEditingNoteId(id);
    setEditingContent(content);
  };

  const handleUpdateNote = (id: string) => {
    if (!editingContent.trim()) return;
    updateNoteInOpportunity(opp.id, id, editingContent.trim());
    setEditingNoteId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      removeNoteFromOpportunity(opp.id, deleteId);
      setDeleteId(null);
    }
  };

  const notes = opp.notes
    .filter((n) => n.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <Card className="border-none shadow-card py-0 h-full max-h-[600px] flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header & Input */}
          <div className="p-6 border-b border-border/40 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={16} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-foreground">Timeline y Notas</h2>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Escribe una nueva nota..."
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="bg-muted/30 focus:bg-background transition-colors resize-none mb-1"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-muted-foreground">
                    <Icon name="Filter" size={12} />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar notas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs h-8 pl-8 pr-3 rounded-md bg-transparent border border-border/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="h-8"
                >
                  <Icon name="Plus" size={14} className="mr-1" /> Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline Scrollable Area */}
          <div className="p-6 overflow-y-auto flex-1 min-h-[250px] relative scrollbar-thin">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay notas registradas.
              </p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/60 before:to-transparent">
                {notes.map((note) => (
                  <div key={note.id} className="relative flex items-start gap-4 group">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 bg-indigo-500/10 text-indigo-500 shadow-sm z-10 mt-1">
                      <Icon name="MessageSquare" size={14} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-muted/10 p-4 rounded-xl border border-border/40 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-foreground/80">
                          {note.author}
                        </span>
                        <div className="flex items-center gap-2">
                          <time className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <Icon name="Calendar" size={10} />
                            {format(new Date(note.createdAt), 'd MMM, HH:mm', { locale: es })}
                          </time>

                          {/* Actions on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(note.id, note.content)}
                              className="p-1 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                              title="Editar"
                            >
                              <Icon name="Edit2" size={12} />
                            </button>
                            <button
                              onClick={() => setDeleteId(note.id)}
                              className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Icon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingNoteId === note.id ? (
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
                              onClick={() => setEditingNoteId(null)}
                              className="h-7 text-xs px-2"
                            >
                              <Icon name="X" size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              onClick={() => handleUpdateNote(note.id)}
                              className="h-7 text-xs px-2"
                            >
                              <Icon name="Check" size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmación Eliminar Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar nota</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta nota del historial de la oportunidad? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button color="error" onClick={confirmDelete}>
              Borrar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
