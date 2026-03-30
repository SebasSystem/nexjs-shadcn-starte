'use client';

import React, { useState } from 'react';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import { PlansTable } from 'src/features/commissions/components/plans/plans-table';
import { PlanDrawer } from 'src/features/commissions/components/plans/plan-drawer';
import { Button } from 'src/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { type PlanComision } from 'src/features/commissions/types/commissions.types';

export const PlansView = () => {
  const { planes, isLoading, addPlan, updatePlan } = usePlans();
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
          <Button color="primary" onClick={() => handleOpenDrawer()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        }
      />

      <SectionCard noPadding>
        {/* Aquí irían los filtros si los hubiera */}
        <PlansTable planes={planes} isLoading={isLoading} onEdit={handleEdit} />
      </SectionCard>

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
