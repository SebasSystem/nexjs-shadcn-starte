'use client';

import React, { useMemo, useState } from 'react';
import { TenantDetailDrawer } from 'src/features/admin/components/tenant-detail-drawer';
import { TenantFormDrawer } from 'src/features/admin/components/tenant-form-drawer';
import { TenantsTable } from 'src/features/admin/components/tenants-table';
import { usePlansAdmin } from 'src/features/admin/hooks/use-plans-admin';
import { useTenants } from 'src/features/admin/hooks/use-tenants';
import { Tenant } from 'src/features/admin/types/admin.types';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

export const TenantsView = () => {
  const {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    suspendTenant,
    activateTenant,
    createTenantUser,
  } = useTenants();
  const { planes } = usePlansAdmin();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterEstado, setFilterEstado] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<Tenant | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        t.nombre.toLowerCase().includes(search.toLowerCase()) ||
        t.dominio.toLowerCase().includes(search.toLowerCase());
      const matchPlan = filterPlan === 'ALL' || t.plan_nombre.includes(filterPlan);
      const matchEstado = filterEstado === 'ALL' || t.estado === filterEstado;
      return matchSearch && matchPlan && matchEstado;
    });
  }, [tenants, search, filterPlan, filterEstado]);

  const activeFiltersCount =
    (filterPlan !== 'ALL' ? 1 : 0) + (filterEstado !== 'ALL' ? 1 : 0) + (search ? 1 : 0);

  const handleOpenNew = () => {
    setSelectedTenant(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const handleFormSave = async (data: Partial<Tenant>) => {
    if (selectedTenant) {
      await updateTenant(selectedTenant.uid, data);
    } else {
      await createTenant(data as unknown as Tenant);
    }
  };

  const handleSuspend = async (tenant: Tenant) => {
    setConfirmSuspend(tenant);
    setConfirmText('');
  };

  const handleConfirmSuspend = async () => {
    if (!confirmSuspend || confirmText !== 'SUSPENDER') return;
    await suspendTenant(confirmSuspend.uid);
    setConfirmSuspend(null);
  };

  const handleActivate = async (tenant: Tenant) => {
    await activateTenant(tenant.uid);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tenants"
        subtitle="Gestiona todos los clientes del sistema"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Nuevo Tenant
          </Button>
        }
      />

      <SectionCard noPadding className="flex flex-col shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end px-5 py-4">
          <Input
            label="Buscar"
            placeholder="Buscar por nombre o dominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" className="h-4 w-4" />}
            className="flex-1 w-full max-w-sm"
          />

          <div className="flex items-end gap-3 w-full sm:w-auto">
            <SelectField
              label="Plan"
              options={[
                { value: 'ALL', label: 'Todos los planes' },
                ...planes.map((p) => ({ value: p.name, label: p.name })),
              ]}
              value={filterPlan}
              onChange={(v) => setFilterPlan(v as string)}
            />
            <SelectField
              label="Estado"
              options={[
                { value: 'ALL', label: 'Todos los estados' },
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'TRIAL', label: 'Trial' },
                { value: 'VENCIDO', label: 'Vencido' },
                { value: 'SUSPENDIDO', label: 'Suspendido' },
              ]}
              value={filterEstado}
              onChange={(v) => setFilterEstado(v as string)}
            />

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFilterPlan('ALL');
                  setFilterEstado('ALL');
                }}
                className="text-muted-foreground h-10 px-3"
              >
                <Icon name="Filter" className="h-4 w-4 mr-2" />
                Limpiar <span className="ml-1 opacity-70">({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
        <TenantsTable
          tenants={filteredTenants}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onViewDetail={handleOpenDetail}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
        />
      </SectionCard>

      <TenantFormDrawer
        tenant={selectedTenant}
        planes={planes}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
      />

      <TenantDetailDrawer
        tenant={selectedTenant}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSuspend={handleSuspend}
        onActivate={handleActivate}
        onCreateUser={createTenantUser}
      />

      {confirmSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="AlertTriangle" className="h-6 w-6 text-red-600 shrink-0" />
              <h3 className="font-semibold text-red-700 text-body2">
                ¿Suspender a &quot;{confirmSuspend.nombre}&quot;?
              </h3>
            </div>
            <p className="text-body2 text-muted-foreground mb-5">
              Esta acción bloqueará el acceso de todos sus usuarios al sistema de forma inmediata.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              label='Escribe "SUSPENDER" para confirmar:'
              placeholder="SUSPENDER"
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setConfirmSuspend(null)}>
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={confirmText !== 'SUSPENDER'}
                onClick={handleConfirmSuspend}
              >
                Confirmar Suspensión
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
