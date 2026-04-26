'use client';

import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { useBilling } from 'src/features/admin/hooks/use-billing';
import { BillingTable } from 'src/features/admin/components/billing-table';
import { BillingDetailDrawer } from 'src/features/admin/components/billing-detail-drawer';
import { Factura } from 'src/features/admin/types/admin.types';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

export const BillingView = () => {
  const { facturas, isLoading, marcarPagadas } = useBilling();

  const [search, setSearch] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('ALL');
  const [filterEstado, setFilterEstado] = useState('ALL');
  const [filterPlan, setFilterPlan] = useState('ALL');

  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsDetailOpen(true);
  };

  const filteredFacturas = useMemo(() => {
    return facturas.filter((f) => {
      const matchSearch = f.tenantNombre.toLowerCase().includes(search.toLowerCase());
      const matchPeriodo = filterPeriodo === 'ALL' || f.periodo === filterPeriodo;
      const matchEstado = filterEstado === 'ALL' || f.estado === filterEstado;
      const matchPlan = filterPlan === 'ALL' || f.planNombre.includes(filterPlan);
      return matchSearch && matchPeriodo && matchEstado && matchPlan;
    });
  }, [facturas, search, filterPeriodo, filterEstado, filterPlan]);

  const activeFiltersCount =
    (filterPeriodo !== 'ALL' ? 1 : 0) +
    (filterEstado !== 'ALL' ? 1 : 0) +
    (filterPlan !== 'ALL' ? 1 : 0) +
    (search ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setFilterPeriodo('ALL');
    setFilterEstado('ALL');
    setFilterPlan('ALL');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Facturación"
        subtitle="Historial de cobros y estado de pagos por tenant"
        action={
          <Button variant="outline" className="gap-2">
            <Icon name="Download" className="h-4 w-4" />
            Generar Reporte
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Cobrado este mes"
          value="$21,350"
          trend="+8% vs anterior"
          icon={<Icon name="DollarSign" className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Pendiente de cobro"
          value="$4,200"
          trend="12 facturas"
          trendUp={false}
          icon={<Icon name="Clock" className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Facturas vencidas"
          value="$1,800"
          trend="7 vencidas"
          trendUp={false}
          icon={<Icon name="AlertTriangle" className="h-5 w-5" />}
          iconClassName="bg-red-500/10 text-red-600"
        />
      </div>

      <SectionCard noPadding className="flex flex-col shadow-sm border border-border/40">
        <div className="flex flex-col sm:flex-row gap-4 items-end px-5 py-4">
          <Input
            label="Buscar"
            placeholder="Buscar tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" className="h-4 w-4" />}
            className="flex-1 w-full max-w-sm"
          />

          <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
            <SelectField
              label="Periodo"
              options={[
                { value: 'ALL', label: 'Todos los periodos' },
                { value: 'Marzo 2025', label: 'Marzo 2025' },
                { value: 'Febrero 2025', label: 'Febrero 2025' },
                { value: 'Enero 2025', label: 'Enero 2025' },
              ]}
              value={filterPeriodo}
              onChange={(v) => setFilterPeriodo(v as string)}
            />
            <SelectField
              label="Estado"
              options={[
                { value: 'ALL', label: 'Todos los estados' },
                { value: 'PAGADA', label: 'Pagada' },
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'VENCIDA', label: 'Vencida' },
                { value: 'CANCELADA', label: 'Cancelada' },
              ]}
              value={filterEstado}
              onChange={(v) => setFilterEstado(v as string)}
            />
            <SelectField
              label="Plan"
              options={[
                { value: 'ALL', label: 'Todos los planes' },
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Business', label: 'Business' },
              ]}
              value={filterPlan}
              onChange={(v) => setFilterPlan(v as string)}
            />

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
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
            <BillingTable
              facturas={filteredFacturas}
              onViewDetail={handleOpenDetail}
              onMarcarPagadas={async (ids) => {
                await marcarPagadas(ids);
              }}
            />
            <div className="col-span-full border-t border-border/40 p-4 flex items-center justify-between text-sm text-muted-foreground bg-card">
              <p>Mostrando {filteredFacturas.length} facturas</p>
            </div>
          </>
        )}
      </SectionCard>

      <BillingDetailDrawer
        factura={selectedFactura}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onMarcarPagada={async (id) => {
          await marcarPagadas([id]);
          setIsDetailOpen(false);
        }}
      />
    </PageContainer>
  );
};
