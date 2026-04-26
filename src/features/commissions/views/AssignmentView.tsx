'use client';

import React, { useState } from 'react';
import { useAssignment } from 'src/features/commissions/hooks/use-assignment';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import { AssignmentsTable } from 'src/features/commissions/components/assignment/assignments-table';
import { AssignmentDrawer } from 'src/features/commissions/components/assignment/assignment-drawer';
import { BulkAssignmentDrawer } from 'src/features/commissions/components/assignment/bulk-assignment-drawer';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Icon } from 'src/shared/components/ui/icon';
import type { AsignacionPlan } from 'src/features/commissions/types/commissions.types';
import type { AssignmentForm } from 'src/features/commissions/schemas/assignment.schema';

export const AssignmentView = () => {
  const { asignaciones, isLoading: isAsigLoading, updateAsignacion } = useAssignment();
  const { planes } = usePlans();

  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionPlan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMasivaOpen, setIsMasivaOpen] = useState(false);

  // States for arbitrary visual filters
  const [searchTerm, setSearchTerm] = useState('');
  const [equipoFilter, setEquipoFilter] = useState('');

  const handleEdit = (asignacion: AsignacionPlan) => {
    setSelectedAsignacion(asignacion);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (id: string, nuevoEstado: string) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de ${nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar'} esta asignación de plan?`
    );
    if (isConfirmed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateAsignacion(id, { estado: nuevoEstado as any });
    }
  };

  const handleSave = async (data: AssignmentForm) => {
    if (selectedAsignacion) {
      return await updateAsignacion(selectedAsignacion.id, data);
    }
    return false;
  };

  const filteredAsignaciones = asignaciones.filter((a) => {
    const matchName = a.vendedorNombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEquipo = equipoFilter ? a.equipoNombre === equipoFilter : true;
    return matchName && matchEquipo;
  });

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Asignación de Planes"
        subtitle="Administra el plan de comisión activo de cada vendedor de tu equipo"
        action={
          <Button variant="outline" color="primary" onClick={() => setIsMasivaOpen(true)}>
            <Icon name="Users" className="mr-2 h-4 w-4" />
            Asignación Masiva
          </Button>
        }
      />

      <SectionCard noPadding>
        {/* Filtros Integrados */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 bg-muted/10">
          <div className="flex-1">
            <Input
              label="Buscar"
              placeholder="Buscar por vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Icon name="Search" size={16} />}
            />
          </div>
          <SelectField
            label="Equipo"
            value={equipoFilter}
            onChange={(val) => setEquipoFilter(val as string)}
            options={[
              { value: '', label: 'Todos los equipos' },
              { value: 'Ventas Directas', label: 'Ventas Directas' },
              { value: 'Mayoristas', label: 'Mayoristas' },
              { value: 'KAM', label: 'KAM' },
            ]}
          />
        </div>

        <AssignmentsTable
          asignaciones={filteredAsignaciones}
          isLoading={isAsigLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </SectionCard>

      <AssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        asignacion={selectedAsignacion}
        planesDisponibles={planes}
        onSave={handleSave}
      />

      <BulkAssignmentDrawer
        isOpen={isMasivaOpen}
        onClose={() => setIsMasivaOpen(false)}
        planesDisponibles={planes}
      />
    </PageContainer>
  );
};
