'use client';

import React, { useState } from 'react';
import { Calendar, Clock, User, Building2 } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { useContacts } from '../../contacts/hooks/use-contacts';
import type { TipoActividad, Actividad } from '../types/productivity.types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (actividad: Omit<Actividad, 'id' | 'estado'>) => Promise<boolean>;
  usuarios: { id: string; nombre: string }[];
  defaultContactId?: string;
  defaultContactNombre?: string;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  usuarios,
  defaultContactId,
  defaultContactNombre,
}) => {
  const { contactos } = useContacts();
  const [tipo, setTipo] = useState<TipoActividad>('TAREA');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [asignadoA, setAsignadoA] = useState(usuarios[0]?.nombre || 'Usuario Actual');
  const [contactoId, setContactoId] = useState(defaultContactId || 'none');

  const handleCreate = async () => {
    if (!titulo.trim() || !fecha) return;

    let cId = contactoId === 'none' ? undefined : contactoId;
    let cNombre = undefined;
    if (cId) {
      const found = contactos.find((c) => c.id === cId);
      if (found) cNombre = found.nombre;
    } else if (defaultContactNombre) {
      cNombre = defaultContactNombre;
      cId = defaultContactId;
    }

    const success = await onSave({
      contactoId: cId,
      contactoNombre: cNombre,
      tipo,
      titulo,
      descripcion,
      fechaVencimiento: new Date(fecha).toISOString(),
      asignadoA,
    });
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[450px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>Agendar Actividad</SheetTitle>
          <SheetDescription>Programa una tarea, recordatorio o reunión</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-5 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Tipo de Actividad
                </label>
                <Select value={tipo} onValueChange={(v: TipoActividad) => setTipo(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TAREA">Tarea</SelectItem>
                    <SelectItem value="RECORDATORIO">Recordatorio</SelectItem>
                    <SelectItem value="REUNION">Reunión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Título (*)
                </label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Presentar cotización final"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Fecha de Vencimiento (*)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Hora límite
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input type="time" className="pl-9" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Asignar a
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Select value={asignadoA} onValueChange={setAsignadoA}>
                    <SelectTrigger className="w-full pl-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((u) => (
                        <SelectItem key={u.id} value={u.nombre}>
                          {u.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Asociar a Cliente (Opcional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Select value={contactoId} onValueChange={setContactoId}>
                    <SelectTrigger className="w-full pl-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin cliente asociado</SelectItem>
                      {contactos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre} ({c.tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Descripción / Notas
                </label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles adicionales sobre lo que se debe hacer..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!titulo.trim() || !fecha}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Agendar {tipo.toLowerCase()}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
