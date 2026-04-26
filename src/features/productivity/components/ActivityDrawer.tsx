'use client';

import React, { useState } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { SelectField } from 'src/shared/components/ui/select-field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
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
              <SelectField
                label="Tipo de Actividad"
                value={tipo}
                onChange={(val) => setTipo(val as TipoActividad)}
                options={[
                  { value: 'TAREA', label: 'Tarea' },
                  { value: 'RECORDATORIO', label: 'Recordatorio' },
                  { value: 'REUNION', label: 'Reunión' },
                ]}
              />

              <Input
                label="Título"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Presentar cotización final"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha de Vencimiento"
                  required
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  leftIcon={<Icon name="Calendar" size={16} />}
                />
                <Input
                  label="Hora límite"
                  type="time"
                  leftIcon={<Icon name="Clock" size={16} />}
                />
              </div>

              <SelectField
                label="Asignar a"
                value={asignadoA}
                onChange={(val) => setAsignadoA(val as string)}
                options={usuarios.map((u) => ({ value: u.nombre, label: u.nombre }))}
              />

              <SelectField
                label="Asociar a Cliente (Opcional)"
                value={contactoId}
                onChange={(val) => setContactoId(val as string)}
                options={[
                  { value: 'none', label: 'Sin cliente asociado' },
                  ...contactos.map((c) => ({ value: c.id, label: `${c.nombre} (${c.tipo})` })),
                ]}
              />

              <Textarea
                label="Descripción / Notas"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles adicionales sobre lo que se debe hacer..."
                className="min-h-[100px] resize-none"
              />
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
