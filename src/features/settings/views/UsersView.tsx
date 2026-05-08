'use client';

import React, { useMemo, useState } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

import { UserDrawer } from '../components/users/user-drawer';
import { UsersTable } from '../components/users/users-table';
import { useRoles } from '../hooks/use-roles';
import { useSettingsUsers } from '../hooks/use-settings-users';
import { useTeams } from '../hooks/use-teams';
import type { SettingsUser } from '../types/settings.types';

export const UsersView = () => {
  const { users, isLoading, createUser, updateUser, toggleStatus, deleteUser, pagination } =
    useSettingsUsers();
  const { roles } = useRoles();
  const { teams } = useTeams();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SettingsUser | null>(null);

  const stats = useMemo(
    () => ({
      total: users.length,
      activos: users.filter((u) => u.status === 'ACTIVO').length,
      pendientes: users.filter((u) => u.status === 'PENDIENTE').length,
      inactivos: users.filter((u) => u.status === 'INACTIVO').length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'ALL' || u.role_uid === filterRole;
      const matchStatus = filterStatus === 'ALL' || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const handleOpenNew = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (user: SettingsUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleSave = async (data: Omit<SettingsUser, 'uid' | 'created_at' | 'last_login_at'>) => {
    if (selectedUser) return updateUser(selectedUser.uid, data);
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
                ...roles.map((r) => ({ value: r.uid, label: r.name })),
              ]}
              value={filterRole}
              onChange={(v) => setFilterRole(v as string)}
            />
            <SelectField
              label="Estado"
              options={[
                { value: 'ALL', label: 'Todos' },
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'INACTIVO', label: 'Inactivo' },
              ]}
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as string)}
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
              onToggleStatus={(u: SettingsUser) => toggleStatus(u.uid)}
              onDelete={(u: SettingsUser) => deleteUser(u.uid)}
              total={pagination.total}
              pageIndex={pagination.page - 1}
              pageSize={pagination.rowsPerPage}
              onPageChange={(pi) => pagination.onChangePage(pi + 1)}
              onPageSizeChange={pagination.onChangeRowsPerPage}
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
        equipos={teams}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
