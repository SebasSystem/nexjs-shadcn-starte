'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { useTenants } from 'src/features/admin/hooks/use-tenants';
import { usePlansAdmin } from 'src/features/admin/hooks/use-plans-admin';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { TenantsTable } from 'src/features/admin/components/tenants-table';
import { TenantDetailDrawer } from 'src/features/admin/components/tenant-detail-drawer';
import { TenantFormDrawer } from 'src/features/admin/components/tenant-form-drawer';
import { Tenant } from 'src/features/admin/types/admin.types';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

export const TenantsView = () => {
  const { tenants, isLoading, createTenant, updateTenant, suspendTenant } = useTenants();
  const { planes } = usePlansAdmin();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterEstado, setFilterEstado] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        t.nombre.toLowerCase().includes(search.toLowerCase()) ||
        t.dominio.toLowerCase().includes(search.toLowerCase());
      const matchPlan = filterPlan === 'ALL' || t.planNombre.includes(filterPlan);
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
      await updateTenant(selectedTenant.id, data);
    } else {
      await createTenant(data as unknown as Tenant);
    }
  };

  const handleSuspend = async (tenant: Tenant) => {
    await suspendTenant(tenant.id);
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
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Business', label: 'Business' },
                { value: 'Enterprise', label: 'Enterprise' },
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
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <TenantsTable
              tenants={filteredTenants}
              onEdit={handleOpenEdit}
              onViewDetail={handleOpenDetail}
              onSuspend={handleSuspend}
            />
            {/* Mock pagination */}
            <div className="border-t border-border/40 p-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>Mostrando {filteredTenants.length} tenants</p>
            </div>
          </>
        )}
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
      />
    </PageContainer>
  );
};
