'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, UserCheck, Clock, UserX } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
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
            <Plus className="h-4 w-4" />
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
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          title="Activos"
          value={stats.activos}
          trend={`${stats.total ? Math.round((stats.activos / stats.total) * 100) : 0}% del total`}
          trendUp
          icon={<UserCheck className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendientes}
          trend={stats.pendientes === 0 ? 'sin pendientes' : `${stats.pendientes} sin activar`}
          trendUp={stats.pendientes === 0}
          icon={<Clock className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Inactivos"
          value={stats.inactivos}
          trend={`${stats.total ? Math.round((stats.inactivos / stats.total) * 100) : 0}% del total`}
          trendUp={false}
          icon={<UserX className="h-5 w-5" />}
          iconClassName="bg-gray-500/10 text-gray-500"
        />
      </div>

      <SectionCard noPadding>
        <div className="flex flex-col sm:flex-row gap-3 items-center px-5 py-4">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1 max-w-sm"
          />
          <div className="flex items-center gap-3">
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
              </SelectContent>
            </Select>
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
