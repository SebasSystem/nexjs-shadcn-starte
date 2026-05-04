'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
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

import type { Equipo, SettingsUser } from '../../types/settings.types';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface TeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  usuarios: SettingsUser[];
  onSave: (
    data: Omit<Equipo, 'id' | 'creadoEn' | 'totalMiembros' | 'miembros'>
  ) => Promise<boolean>;
  onAddMember: (equipoId: string, usuarioId: string) => void;
  onRemoveMember: (equipoId: string, usuarioId: string) => void;
}

export const TeamDrawer: React.FC<TeamDrawerProps> = ({
  isOpen,
  onClose,
  equipo,
  usuarios,
  onSave,
  onAddMember,
  onRemoveMember,
}) => {
  const [nombre, setNombre] = useState(equipo?.nombre ?? '');
  const [liderId, setLiderId] = useState(equipo?.liderId ?? '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim() || !liderId) return;
    const lider = usuarios.find((u) => u.id === liderId);
    setIsSubmitting(true);
    const success = await onSave({
      nombre,
      liderId,
      liderNombre: lider?.nombre ?? '',
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleAddMember = () => {
    if (!selectedUserId || !equipo) return;
    const user = usuarios.find((u) => u.id === selectedUserId);
    if (!user) return;
    onAddMember(equipo.id, selectedUserId);
    setSelectedUserId('');
  };

  const memberIds = equipo?.miembros.map((m) => m.usuarioId) ?? [];
  const availableUsers = usuarios.filter((u) => !memberIds.includes(u.id) && u.estado === 'ACTIVO');

  const liderOptions = usuarios
    .filter((u) => u.estado === 'ACTIVO')
    .map((u) => ({ value: u.id, label: `${u.nombre} (${u.rolNombre})` }));

  const miembroOptions = availableUsers.map((u) => ({ value: u.id, label: u.nombre }));

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{equipo ? 'Editar Equipo' : 'Nuevo Equipo'}</SheetTitle>
          <SheetDescription>Configura el equipo y sus miembros</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-6">
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              label="Nombre del equipo"
              required
              placeholder="Ej. Equipo Norte"
            />

            <SelectField
              value={liderId}
              onChange={(val) => setLiderId(val as string)}
              label="Líder del equipo"
              required
              options={liderOptions}
              placeholder="Seleccionar líder..."
            />

            {equipo && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                  Miembros
                </h3>

                {equipo.miembros.length > 0 ? (
                  <div className="space-y-2">
                    {equipo.miembros.map((miembro) => (
                      <div
                        key={miembro.usuarioId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(miembro.usuarioNombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{miembro.usuarioNombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {miembro.rolNombre} · {miembro.clientesAsignados} clientes
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveMember(equipo.id, miembro.usuarioId)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin miembros todavía.</p>
                )}

                <div className="flex gap-2">
                  <div className="flex-1">
                    <SelectField
                      value={selectedUserId}
                      onChange={(val) => setSelectedUserId(val as string)}
                      options={miembroOptions}
                      placeholder="Agregar miembro..."
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddMember}
                    disabled={!selectedUserId}
                    className="gap-1.5 h-10"
                  >
                    <Icon name="UserPlus" size={14} /> Agregar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!nombre.trim() || !liderId || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
