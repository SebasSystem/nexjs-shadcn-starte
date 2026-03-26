'use client';

import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { useFacturacion } from 'src/features/admin/hooks/use-facturacion';
import { FacturacionTable } from 'src/features/admin/components/facturacion/facturacion-table';
import { FacturaDetailDrawer } from 'src/features/admin/components/facturacion/factura-detail-drawer';
import { Factura } from 'src/features/admin/types/admin.types';
import { Input } from 'src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { Button } from 'src/shared/components/ui/button';
import { DollarSign, Clock, AlertTriangle, Search, Filter, Download } from 'lucide-react';

export const FacturacionView = () => {
  const { facturas, isLoading, marcarPagadas } = useFacturacion();

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
            <Download className="h-4 w-4" />
            Generar Reporte
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Cobrado este mes"
          value="$21,350"
          trend="+8% vs anterior"
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          title="Pendiente de cobro"
          value="$4,200"
          trend="12 facturas"
          trendUp={false}
          icon={<Clock className="h-5 w-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Facturas vencidas"
          value="$1,800"
          trend="7 vencidas"
          trendUp={false}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconClassName="bg-red-500/10 text-red-600"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center w-full mt-2">
        <Input
          placeholder="Buscar tenant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1 w-full max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
            <SelectTrigger className="w-[140px] shadow-sm">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los periodos</SelectItem>
              <SelectItem value="Marzo 2025">Marzo 2025</SelectItem>
              <SelectItem value="Febrero 2025">Febrero 2025</SelectItem>
              <SelectItem value="Enero 2025">Enero 2025</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[140px] shadow-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="PAGADA">Pagada</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="VENCIDA">Vencida</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-[140px] bg-card border-border/40 shadow-sm">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los planes</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground h-10 px-3"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar <span className="ml-1 opacity-70">({activeFiltersCount})</span>
            </Button>
          )}
        </div>
      </div>

      <SectionCard noPadding className="flex flex-col shadow-sm border border-border/40">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <FacturacionTable
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

      <FacturaDetailDrawer
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
