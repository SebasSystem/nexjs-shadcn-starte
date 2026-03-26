'use client';

import React, { useState } from 'react';
import { usePlanes } from 'src/features/comisiones/hooks/use-planes';
import { PlanesTable } from 'src/features/comisiones/components/planes/planes-table';
import { PlanDrawer } from 'src/features/comisiones/components/planes/plan-drawer';
import { Button } from 'src/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { type PlanComision } from 'src/features/comisiones/types/comisiones.types';

export const PlanesView = () => {
  const { planes, isLoading, addPlan, updatePlan } = usePlanes();
  const [selectedPlan, setSelectedPlan] = useState<PlanComision | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleEdit = (plan: PlanComision) => {
    setSelectedPlan(plan);
    setIsDrawerOpen(true);
  };

  const handleOpenDrawer = () => {
    setSelectedPlan(null);
    setIsDrawerOpen(true);
  };

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Planes de Comisión"
        subtitle="Configura y administra los planes de incentivos para tu equipo comercial"
        action={
          <Button onClick={() => handleOpenDrawer()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Aquí irían los filtros si los hubiera */}
        <PlanesTable planes={planes} isLoading={isLoading} onEdit={handleEdit} />
      </div>

      <PlanDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        plan={selectedPlan}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSave={async (data: any) => {
          if (selectedPlan) {
            return await updatePlan(selectedPlan.id, data);
          } else {
            return await addPlan(data);
          }
        }}
      />
    </PageContainer>
  );
};
