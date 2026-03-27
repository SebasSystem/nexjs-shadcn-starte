'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
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

const STAT_CONFIG = [
  {
    key: 'total' as const,
    label: 'Total',
    icon: Users,
    iconColor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    key: 'activos' as const,
    label: 'Activos',
    icon: UserCheck,
    iconColor: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    key: 'pendientes' as const,
    label: 'Pendientes',
    icon: Clock,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    key: 'inactivos' as const,
    label: 'Inactivos',
    icon: UserX,
    iconColor: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
  },
];

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
          <Button onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Invitar usuario
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, iconColor, bg, border }) => (
          <div
            key={key}
            className={`flex items-center gap-4 rounded-xl border ${border} ${bg} px-5 py-4`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm">
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-bold leading-none text-foreground">{stats[key]}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
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

      <SectionCard noPadding className="shadow-sm border border-border/40">
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
