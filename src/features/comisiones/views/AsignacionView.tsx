'use client';

import React, { useState } from 'react';
import { useAsignacion } from 'src/features/comisiones/hooks/use-asignacion';
import { usePlanes } from 'src/features/comisiones/hooks/use-planes'; // Para tener los planes disponibles
import { AsignacionTable } from 'src/features/comisiones/components/asignacion/asignacion-table';
import { AsignacionDrawer } from 'src/features/comisiones/components/asignacion/asignacion-drawer';
import { AsignacionMasivaDrawer } from 'src/features/comisiones/components/asignacion/asignacion-masiva-drawer';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Users } from 'lucide-react';
import type { AsignacionPlan } from 'src/features/comisiones/types/comisiones.types';
import type { AsignacionForm } from 'src/features/comisiones/schemas/asignacion.schema';

export const AsignacionView = () => {
  const { asignaciones, isLoading: isAsigLoading, updateAsignacion } = useAsignacion();
  const { planes } = usePlanes();

  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionPlan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMasivaOpen, setIsMasivaOpen] = useState(false);

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

  const handleSave = async (data: AsignacionForm) => {
    if (selectedAsignacion) {
      return await updateAsignacion(selectedAsignacion.id, data);
    }
    return false;
  };

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Asignación de Planes"
        subtitle="Administra el plan de comisión activo de cada vendedor de tu equipo"
        action={
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => setIsMasivaOpen(true)}
          >
            <Users className="mr-2 h-4 w-4" />
            Asignación Masiva
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <AsignacionTable
          asignaciones={asignaciones}
          isLoading={isAsigLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <AsignacionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        asignacion={selectedAsignacion}
        planesDisponibles={planes}
        onSave={handleSave}
      />

      <AsignacionMasivaDrawer
        isOpen={isMasivaOpen}
        onClose={() => setIsMasivaOpen(false)}
        planesDisponibles={planes}
      />
    </PageContainer>
  );
};
