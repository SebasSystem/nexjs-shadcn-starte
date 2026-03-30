'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { useTenants } from 'src/features/admin/hooks/use-tenants';
import { usePlansAdmin } from 'src/features/admin/hooks/use-plans-admin';
import { Button } from 'src/shared/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { TenantsTable } from 'src/features/admin/components/tenants-table';
import { TenantDetailDrawer } from 'src/features/admin/components/tenant-detail-drawer';
import { TenantFormDrawer } from 'src/features/admin/components/tenant-form-drawer';
import { Tenant } from 'src/features/admin/types/admin.types';
import { Input } from 'src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';

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
            <Plus className="h-4 w-4" />
            Nuevo Tenant
          </Button>
        }
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <Input
            placeholder="Buscar por nombre o dominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1 w-full max-w-sm"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-[140px] shadow-sm">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los planes</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[140px] border-border/40 shadow-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
              </SelectContent>
            </Select>

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
                <Filter className="h-4 w-4 mr-2" />
                Limpiar <span className="ml-1 opacity-70">({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard noPadding className="flex flex-col shadow-sm border border-border/40">
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
