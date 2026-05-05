'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { TeamDrawer } from '../components/teams/team-drawer';
import { TeamsGrid } from '../components/teams/teams-table';
import { useSettingsUsers } from '../hooks/use-settings-users';
import { useTeams } from '../hooks/use-teams';
import type { Team } from '../types/settings.types';

export const TeamsView = () => {
  const { teams, isLoading, createTeam, updateTeam, addMember, removeMember, deleteTeam } =
    useTeams();
  const { users } = useSettingsUsers();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleOpenNew = () => {
    setSelectedTeam(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsDrawerOpen(true);
  };

  const handleSave = async (
    data: Omit<Team, 'uid' | 'created_at' | 'members_count' | 'members'>
  ) => {
    if (selectedTeam) return updateTeam(selectedTeam.uid, data);
    return createTeam(data);
  };

  const handleAddMember = (teamUid: string, userUid: string) => {
    addMember(teamUid, userUid);
  };

  const handleRemoveMember = (teamUid: string, userUid: string) => {
    removeMember(teamUid, userUid);
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
          <TeamsGrid teams={teams} onEdit={handleEdit} onDelete={(t) => deleteTeam(t.uid)} />
          <div className="p-4 text-sm text-muted-foreground">
            {teams.length} equipo{teams.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      <TeamDrawer
        key={isDrawerOpen ? (selectedTeam?.uid ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        team={selectedTeam}
        usuarios={users}
        onSave={handleSave}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
    </PageContainer>
  );
};
