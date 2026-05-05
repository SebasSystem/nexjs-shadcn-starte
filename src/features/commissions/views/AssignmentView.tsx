'use client';

import React, { useState } from 'react';
import { AssignmentDrawer } from 'src/features/commissions/components/assignment/assignment-drawer';
import { AssignmentsTable } from 'src/features/commissions/components/assignment/assignments-table';
import { BulkAssignmentDrawer } from 'src/features/commissions/components/assignment/bulk-assignment-drawer';
import { useAssignment } from 'src/features/commissions/hooks/use-assignment';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import type { AssignmentForm } from 'src/features/commissions/schemas/assignment.schema';
import type { CommissionAssignment } from 'src/features/commissions/types/commissions.types';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

export const AssignmentView = () => {
  const { assignments, isLoading: isAsigLoading, updateAssignment } = useAssignment();
  const { plans } = usePlans();

  const [selectedAsignacion, setSelectedAsignacion] = useState<CommissionAssignment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMasivaOpen, setIsMasivaOpen] = useState(false);

  // States for arbitrary visual filters
  const [searchTerm, setSearchTerm] = useState('');
  const [equipoFilter, setEquipoFilter] = useState('');

  const handleEdit = (asignacion: CommissionAssignment) => {
    setSelectedAsignacion(asignacion);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (id: string, nuevoEstado: string) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de ${nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar'} esta asignación de plan?`
    );
    if (isConfirmed) {
      updateAssignment(id, { status: nuevoEstado });
    }
  };

  const handleSave = async (data: AssignmentForm): Promise<boolean> => {
    if (selectedAsignacion) {
      const result = await updateAssignment(selectedAsignacion.uid, {
        plan_uid: data.plan_uid,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
      });
      return !!result;
    }
    return false;
  };

  const filteredAsignaciones = assignments.filter((a) => {
    const matchName = a.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEquipo = equipoFilter ? a.team_name === equipoFilter : true;
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
              { value: 'Ventas Norte', label: 'Ventas Norte' },
              { value: 'Ventas Sur', label: 'Ventas Sur' },
              { value: 'Ventas Centro', label: 'Ventas Centro' },
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
        planesDisponibles={plans}
        onSave={handleSave}
      />

      <BulkAssignmentDrawer
        isOpen={isMasivaOpen}
        onClose={() => setIsMasivaOpen(false)}
        planesDisponibles={plans}
      />
    </PageContainer>
  );
};
