'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { useSettingsUsers } from '../hooks/use-settings-users';
import { useRoles } from '../hooks/use-roles';
import { useTeams } from '../hooks/use-teams';
import { UsersTable } from '../components/users/users-table';
import { UserDrawer } from '../components/users/user-drawer';
import type { SettingsUser } from '../types/settings.types';

export const UsersView = () => {
  const { users, isLoading, createUser, updateUser, toggleEstado, deleteUser } = useSettingsUsers();
  const { roles } = useRoles();
  const { equipos } = useTeams();

  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('ALL');
  const [filterEstado, setFilterEstado] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SettingsUser | null>(null);

  const stats = useMemo(
    () => ({
      total: users.length,
      activos: users.filter((u) => u.estado === 'ACTIVO').length,
      pendientes: users.filter((u) => u.estado === 'PENDIENTE').length,
      inactivos: users.filter((u) => u.estado === 'INACTIVO').length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRol = filterRol === 'ALL' || u.rolId === filterRol;
      const matchEstado = filterEstado === 'ALL' || u.estado === filterEstado;
      return matchSearch && matchRol && matchEstado;
    });
  }, [users, search, filterRol, filterEstado]);

  const handleOpenNew = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (user: SettingsUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleSave = async (data: Omit<SettingsUser, 'id' | 'creadoEn' | 'ultimoAcceso'>) => {
    if (selectedUser) return updateUser(selectedUser.id, data);
    return createUser(data);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona los usuarios y sus accesos al sistema"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" size={16} />
            Invitar usuario
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          title="Total"
          value={stats.total}
          trend="registrados"
          trendUp
          icon={<Icon name="Users" size={20} />}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          title="Activos"
          value={stats.activos}
          trend={`${stats.total ? Math.round((stats.activos / stats.total) * 100) : 0}% del total`}
          trendUp
          icon={<Icon name="UserCheck" size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendientes}
          trend={stats.pendientes === 0 ? 'sin pendientes' : `${stats.pendientes} sin activar`}
          trendUp={stats.pendientes === 0}
          icon={<Icon name="Clock" size={20} />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Inactivos"
          value={stats.inactivos}
          trend={`${stats.total ? Math.round((stats.inactivos / stats.total) * 100) : 0}% del total`}
          trendUp={false}
          icon={<Icon name="UserX" size={20} />}
          iconClassName="bg-gray-500/10 text-gray-500"
        />
      </div>

      <SectionCard noPadding>
        <div className="flex flex-col sm:flex-row gap-3 items-end px-5 py-4">
          <Input
            label="Buscar"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" size={16} />}
            className="flex-1 max-w-sm"
          />
          <div className="flex items-end gap-3">
            <SelectField
              label="Rol"
              options={[
                { value: 'ALL', label: 'Todos los roles' },
                ...roles.map((r) => ({ value: r.id, label: r.nombre })),
              ]}
              value={filterRol}
              onChange={(v) => setFilterRol(v as string)}
            />
            <SelectField
              label="Estado"
              options={[
                { value: 'ALL', label: 'Todos' },
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'INACTIVO', label: 'Inactivo' },
              ]}
              value={filterEstado}
              onChange={(v) => setFilterEstado(v as string)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <UsersTable
              users={filteredUsers}
              onEdit={handleEdit}
              onToggleEstado={(u) => toggleEstado(u.id)}
              onDelete={(u) => deleteUser(u.id)}
            />
            <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </SectionCard>

      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={selectedUser}
        roles={roles}
        equipos={equipos}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
