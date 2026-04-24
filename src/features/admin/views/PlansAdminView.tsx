'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { usePlansAdmin } from 'src/features/admin/hooks/use-plans-admin';
import { PlanSaaS } from 'src/features/admin/types/admin.types';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { PlanCard } from 'src/features/admin/components/plan-card';
import { PlanFormDrawer } from 'src/features/admin/components/plan-form-drawer';

export const PlansAdminView = () => {
  const { planes, isLoading, createPlan, updatePlan } = usePlansAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanSaaS | null>(null);

  const handleOpenNew = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: PlanSaaS) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<PlanSaaS>) => {
    if (selectedPlan) {
      await updatePlan(selectedPlan.id, data);
    } else {
      await createPlan(data as unknown as PlanSaaS);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Planes de Suscripción"
        subtitle="Define los paquetes y sus límites de funcionalidades"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Nuevo Plan
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] bg-muted/40 rounded-2xl border border-border/20" />
          ))}
        </div>
      ) : planes.length === 0 ? (
        <SectionCard className="flex flex-col items-center justify-center py-20 text-center mt-4">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Icon name="PackageOpen" className="h-12 w-12 text-primary opacity-80" />
          </div>
          <h3 className="text-h6 text-foreground font-semibold mb-2">No hay planes creados</h3>
          <p className="text-body2 text-muted-foreground max-w-sm mb-6">
            Comienza creando los niveles de suscripción que ofrecerás a tus tenants.
          </p>
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Crear primer plan
          </Button>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
          {planes.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onEdit={() => handleOpenEdit(plan)} />
          ))}
        </div>
      )}

      {/* Using dynamic key to reset form state when selectedPlan changes */}
      {isFormOpen && (
        <PlanFormDrawer
          key={selectedPlan ? selectedPlan.id : 'new-plan'}
          plan={selectedPlan}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  );
};
