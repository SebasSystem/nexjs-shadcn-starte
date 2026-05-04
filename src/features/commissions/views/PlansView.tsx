'use client';

import React, { useState } from 'react';
import { PlanDrawer } from 'src/features/commissions/components/plans/plan-drawer';
import { PlansTable } from 'src/features/commissions/components/plans/plans-table';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import { type PlanComision } from 'src/features/commissions/types/commissions.types';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

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
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        }
      />

      <SectionCard noPadding>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-h6 text-foreground">Lista de planes</p>
        </div>
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
