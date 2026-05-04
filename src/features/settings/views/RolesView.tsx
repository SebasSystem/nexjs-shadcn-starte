'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { RoleDrawer } from '../components/roles/role-drawer';
import { RolesTable } from '../components/roles/roles-table';
import { useRoles } from '../hooks/use-roles';
import type { Rol } from '../types/settings.types';

export const RolesView = () => {
  const { roles, isLoading, createRol, updateRol, deleteRol } = useRoles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);

  const handleOpenNew = () => {
    setSelectedRol(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (rol: Rol) => {
    setSelectedRol(rol);
    setIsDrawerOpen(true);
  };

  const handleSave = async (data: Omit<Rol, 'id' | 'creadoEn' | 'totalUsuarios'>) => {
    if (selectedRol) return updateRol(selectedRol.id, data);
    return createRol(data);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Roles y Permisos"
        subtitle="Define los niveles de acceso para cada tipo de usuario"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo rol
          </Button>
        }
      />

      <SectionCard noPadding>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-h6 text-foreground">Roles configurados</p>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <RolesTable roles={roles} onEdit={handleEdit} onDelete={(r) => deleteRol(r.id)} />
            <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
              {roles.length} rol{roles.length !== 1 ? 'es' : ''} configurado
              {roles.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </SectionCard>

      <RoleDrawer
        key={isDrawerOpen ? (selectedRol?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        rol={selectedRol}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
