'use client';

import React, { useState } from 'react';
import { PlanDrawer } from 'src/features/commissions/components/plans/plan-drawer';
import { PlansTable } from 'src/features/commissions/components/plans/plans-table';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import type { PlanForm } from 'src/features/commissions/schemas/plan.schema';
import type { CommissionPlan } from 'src/features/commissions/types/commissions.types';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

export const PlansView = () => {
  const { plans, isLoading, createPlan, updatePlan } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<CommissionPlan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleEdit = (plan: CommissionPlan) => {
    setSelectedPlan(plan);
    setIsDrawerOpen(true);
  };

  const handleOpenDrawer = () => {
    setSelectedPlan(null);
    setIsDrawerOpen(true);
  };

  const handleSave = async (form: PlanForm): Promise<boolean> => {
    if (selectedPlan?.uid) {
      const result = await updatePlan(selectedPlan.uid, {
        name: form.name,
        type: form.type,
        base_percentage: form.base_percentage,
        tiers: form.tiers.map((t) => ({ threshold: t.threshold, percent: t.percentage })),
        applicable_roles: form.applicable_roles,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
      });
      return !!result;
    }
    const result = await createPlan({
      name: form.name,
      type: form.type,
      base_percentage: form.base_percentage,
      tiers: form.tiers.map((t) => ({ threshold: t.threshold, percent: t.percentage })),
      applicable_roles: form.applicable_roles,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
    });
    return !!result;
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
        <PlansTable planes={plans} isLoading={isLoading} onEdit={handleEdit} />
      </SectionCard>

      <PlanDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        plan={selectedPlan}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
