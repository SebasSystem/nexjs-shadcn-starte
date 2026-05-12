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
import { useDebounce } from 'use-debounce';

import { useSettingsUsers } from '../../hooks/use-settings-users';
import type { Team } from '../../types/settings.types';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface TeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSave: (
    data: Omit<Team, 'uid' | 'created_at' | 'members_count' | 'members'>
  ) => Promise<boolean>;
  onAddMember: (teamUid: string, userUid: string) => void;
  onRemoveMember: (teamUid: string, userUid: string) => void;
}

export const TeamDrawer: React.FC<TeamDrawerProps> = ({
  isOpen,
  onClose,
  team,
  onSave,
  onAddMember,
  onRemoveMember,
}) => {
  const [name, setName] = useState(team?.name ?? '');
  const [liderId, setLiderId] = useState(team?.leader_uid ?? '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch] = useDebounce(userSearch, 400);

  const { users } = useSettingsUsers({
    search: debouncedUserSearch || undefined,
  });

  const handleSave = async () => {
    if (!name.trim() || !liderId) return;
    const lider = users.find((u) => u.uid === liderId);
    setIsSubmitting(true);
    const success = await onSave({
      name,
      leader_uid: liderId,
      leader_name: lider?.name ?? '',
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleAddMember = () => {
    if (!selectedUserId || !team) return;
    onAddMember(team.uid, selectedUserId);
    setSelectedUserId('');
  };

  const memberIds = team?.members.map((m) => m.user_uid) ?? [];
  const availableUsers = users.filter((u) => !memberIds.includes(u.uid) && u.status === 'ACTIVO');

  const liderOptions = users
    .filter((u) => u.status === 'ACTIVO')
    .map((u) => ({ value: u.uid, label: `${u.name} (${u.role_name})` }));

  const miembroOptions = availableUsers.map((u) => ({ value: u.uid, label: u.name }));

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{team ? 'Editar Equipo' : 'Nuevo Equipo'}</SheetTitle>
          <SheetDescription>Configura el equipo y sus miembros</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-6">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Nombre del equipo"
              required
              placeholder="Ej. Equipo Norte"
            />

            <SelectField
              value={liderId}
              onChange={(val) => setLiderId(val as string)}
              label="Líder del equipo"
              required
              searchable
              onSearch={setUserSearch}
              options={liderOptions}
              placeholder="Seleccionar líder..."
            />

            {team && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                  Miembros
                </h3>

                {team.members.length > 0 ? (
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.user_uid}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(member.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role_name} · {member.assigned_clients} clientes
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveMember(team.uid, member.user_uid)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
                      searchable
                      onSearch={setUserSearch}
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
                    className="gap-1.5 h-10 cursor-pointer"
                  >
                    <Icon name="UserPlus" size={14} /> Agregar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !liderId || isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
