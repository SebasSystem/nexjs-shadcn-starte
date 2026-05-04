'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { TeamDrawer } from '../components/teams/team-drawer';
import { TeamsTable } from '../components/teams/teams-table';
import { useSettingsUsers } from '../hooks/use-settings-users';
import { useTeams } from '../hooks/use-teams';
import type { Equipo, MiembroEquipo } from '../types/settings.types';

export const TeamsView = () => {
  const { equipos, isLoading, createEquipo, updateEquipo, addMember, removeMember, deleteEquipo } =
    useTeams();
  const { users } = useSettingsUsers();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);

  const handleOpenNew = () => {
    setSelectedEquipo(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setIsDrawerOpen(true);
  };

  const handleSave = async (
    data: Omit<Equipo, 'id' | 'creadoEn' | 'totalMiembros' | 'miembros'>
  ) => {
    if (selectedEquipo) return updateEquipo(selectedEquipo.id, data);
    return createEquipo(data);
  };

  const handleAddMember = (equipoId: string, usuarioId: string) => {
    const user = users.find((u) => u.id === usuarioId);
    if (!user) return;
    const miembro: MiembroEquipo = {
      usuarioId,
      usuarioNombre: user.nombre,
      rolNombre: user.rolNombre,
      clientesAsignados: 0,
    };
    addMember(equipoId, miembro);
    setSelectedEquipo((prev) =>
      prev?.id === equipoId
        ? { ...prev, miembros: [...prev.miembros, miembro], totalMiembros: prev.totalMiembros + 1 }
        : prev
    );
  };

  const handleRemoveMember = (equipoId: string, usuarioId: string) => {
    removeMember(equipoId, usuarioId);
    setSelectedEquipo((prev) =>
      prev?.id === equipoId
        ? {
            ...prev,
            miembros: prev.miembros.filter((m) => m.usuarioId !== usuarioId),
            totalMiembros: prev.totalMiembros - 1,
          }
        : prev
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Equipos y Cartera"
        subtitle="Organiza vendedores en equipos y controla qué clientes puede ver cada uno"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo equipo
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-muted/40 rounded-2xl w-full" />
          ))}
        </div>
      ) : (
        <>
          <TeamsTable equipos={equipos} onEdit={handleEdit} onDelete={(e) => deleteEquipo(e.id)} />
          <div className="p-4 text-sm text-muted-foreground">
            {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      <TeamDrawer
        key={isDrawerOpen ? (selectedEquipo?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        equipo={selectedEquipo}
        usuarios={users}
        onSave={handleSave}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
    </PageContainer>
  );
};
