'use client';

import { useState } from 'react';
import { Plus, TrendingUp, BarChart2, Trophy, Search } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { PipelineColumn } from '../components/PipelineColumn';
import { NewOpportunityDrawer } from '../components/NewOpportunityDrawer';
import { usePipeline } from '../hooks/usePipeline';
import type { Opportunity } from 'src/features/sales/types/sales.types';
import { SelectField } from 'src/shared/components/ui/select-field';

const ORIGIN_OPTIONS = [
  { value: 'Web', label: 'Sitio Web' },
  { value: 'Facebook Ads', label: 'Facebook Ads' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Referido', label: 'Referido' },
  { value: 'Evento', label: 'Evento / Conferencia' },
  { value: 'Email', label: 'Campaña de Email' },
  { value: 'Otro', label: 'Otro' },
];

const MAIN_PRODUCTS = [
  { value: 'Licencias ERP', label: 'Licencias ERP' },
  { value: 'Implementación', label: 'Servicio de Implementación' },
  { value: 'Infraestructura Cloud', label: 'Infraestructura Cloud' },
  { value: 'Consultoría Estratégica', label: 'Consultoría Estratégica' },
  { value: 'Soporte Técnico', label: 'Soporte Técnico Anual' },
  { value: 'Otro', label: 'Otro' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PipelineView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { stages, opportunitiesByStage, metrics, addOpportunity, filters, setFilters } =
    usePipeline();

  const handleSaveOpportunity = (data: Omit<Opportunity, 'id' | 'createdAt'>) => {
    addOpportunity(data);
  };

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Pipeline Comercial"
        subtitle="Gestiona y visualiza el avance de tus oportunidades de venta"
        action={
          <Button color="primary" onClick={() => setDrawerOpen(true)}>
            <Plus size={16} />
            Nueva Oportunidad
          </Button>
        }
      />

      {/* ── Filtros y Búsqueda ───────────────────────────────────────── */}
      <SectionCard className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="w-full h-10 pl-10 pr-4 text-sm bg-muted/30 border border-border/50 rounded-lg outline-none focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Buscar por cliente o contacto..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="w-full sm:w-48">
              <SelectField
                options={[{ value: '', label: 'Cualquier origen' }, ...ORIGIN_OPTIONS]}
                value={filters.source}
                onChange={(v) => setFilters((p) => ({ ...p, source: v as string }))}
              />
            </div>
            <div className="w-full sm:w-48">
              <SelectField
                options={[{ value: '', label: 'Cualquier producto' }, ...MAIN_PRODUCTS]}
                value={filters.mainProduct}
                onChange={(v) => setFilters((p) => ({ ...p, mainProduct: v as string }))}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Métricas ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 shrink-0">
        <StatsCard
          title="Total Pipeline"
          value={formatCurrency(metrics.totalPipelineValue)}
          icon={<TrendingUp size={20} />}
          iconClassName="bg-indigo-500/10 text-indigo-500"
        />
        <StatsCard
          title="Oportunidades Activas"
          value={metrics.activeCount}
          icon={<BarChart2 size={20} />}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="Cerradas Ganadas"
          value={metrics.closedWonCount}
          icon={<Trophy size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      {/* ── Tablero Kanban ─────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar mt-4">
        <div className="flex gap-4 min-w-max pr-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              opportunities={opportunitiesByStage.get(stage.id) ?? []}
            />
          ))}
        </div>
      </div>

      {/* ── Drawer Nueva Oportunidad ──────────────────────────────────── */}
      <NewOpportunityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveOpportunity}
      />
    </PageContainer>
  );
}
