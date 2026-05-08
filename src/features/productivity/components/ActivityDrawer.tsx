'use client';

import React, { useState } from 'react';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { Textarea } from 'src/shared/components/ui/textarea';

import { useContacts } from '../../contacts/hooks/use-contacts';
import type { ActivityType } from '../types/productivity.types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    contact_uid?: string;
    contact_name?: string;
    type: ActivityType;
    title: string;
    description?: string;
    due_date: string;
    assigned_to_name?: string;
  }) => Promise<boolean>;
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
  const [type, setType] = useState<ActivityType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(usuarios[0]?.nombre || 'Usuario Actual');
  const [contactUid, setContactUid] = useState(defaultContactId || 'none');

  const handleCreate = async () => {
    if (!title.trim() || !dueDate) return;

    let cUid = contactUid === 'none' ? undefined : contactUid;
    let cName = undefined;
    if (cUid) {
      const found = contactos.find((c) => c.uid === cUid);
      if (found) cName = found.name;
    } else if (defaultContactNombre) {
      cName = defaultContactNombre;
      cUid = defaultContactId;
    }

    const success = await onSave({
      contact_uid: cUid,
      contact_name: cName,
      type,
      title,
      description,
      due_date: new Date(dueDate).toISOString(),
      assigned_to_name: assignedTo,
    });
    if (success) onClose();
  };

  const activityLabel =
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
                value={type}
                onChange={(val) => setType(val as ActivityType)}
                options={[
                  { value: 'task', label: 'Tarea' },
                  { value: 'call', label: 'Llamada' },
                  { value: 'meeting', label: 'Reunión' },
                  { value: 'email', label: 'Correo' },
                  { value: 'note', label: 'Nota' },
                  { value: 'reminder', label: 'Recordatorio' },
                ]}
              />

              <Input
                label="Título"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Presentar cotización final"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha de Vencimiento"
                  required
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  leftIcon={<Icon name="Calendar" size={16} />}
                />
                <Input label="Hora límite" type="time" leftIcon={<Icon name="Clock" size={16} />} />
              </div>

              <SelectField
                label="Asignar a"
                value={assignedTo}
                onChange={(val) => setAssignedTo(val as string)}
                options={usuarios.map((u) => ({ value: u.nombre, label: u.nombre }))}
              />

              <SelectField
                label="Asociar a Cliente (Opcional)"
                value={contactUid}
                onChange={(val) => setContactUid(val as string)}
                options={[
                  { value: 'none', label: 'Sin cliente asociado' },
                  ...contactos.map((c) => ({
                    value: c.uid,
                    label: `${c.name} (${c.type})`,
                  })),
                ]}
              />

              <Textarea
                label="Descripción / Notas"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            disabled={!title.trim() || !dueDate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Agendar {activityLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
