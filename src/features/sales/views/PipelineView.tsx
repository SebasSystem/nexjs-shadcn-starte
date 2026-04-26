'use client';

import { useState } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Input } from 'src/shared/components/ui/input';
import { PipelineColumn } from '../components/PipelineColumn';
import { NewOpportunityDrawer } from '../components/NewOpportunityDrawer';
import { OpportunityPanel } from '../components/OpportunityPanel';
import { OutcomeDialog } from '../components/OutcomeDialog';
import { PipelineChevron } from '../components/PipelineChevron';
import { usePipeline } from '../hooks/usePipeline';
import { useOpportunityPanel } from '../hooks/useOpportunityPanel';
import { useSalesContext } from '../context/SalesContext';
import type { Opportunity, StageId, LostReasonInfo } from 'src/features/sales/types/sales.types';

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

export function PipelineView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ oppId: string } | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);

  const { stages, opportunitiesByStage, addOpportunity, filters, setFilters } = usePipeline();
  const { moveOpportunity, opportunities } = useSalesContext();
  const { selectedId, isOpen, openPanel, closePanel, daysInStage, agingLevel } =
    useOpportunityPanel();

  const pendingOpportunity = pendingMove
    ? opportunities.find((o) => o.id === pendingMove.oppId)
    : undefined;

  const handleColumnDrop = (oppId: string, targetStage: StageId) => {
    if (targetStage === 'cerrado') {
      setPendingMove({ oppId });
      setOutcomeDialogOpen(true);
    } else {
      moveOpportunity(oppId, targetStage);
    }
  };

  const handleOutcomeConfirm = (outcome: 'ganado' | 'perdido', lostReason?: LostReasonInfo) => {
    if (!pendingMove) return;
    moveOpportunity(pendingMove.oppId, 'cerrado', { outcome, lostReason });
    setOutcomeDialogOpen(false);
    setPendingMove(null);
  };

  const handleOutcomeCancel = () => {
    setOutcomeDialogOpen(false);
    setPendingMove(null);
  };

  const handleSaveOpportunity = (
    data: Omit<
      Opportunity,
      'id' | 'createdAt' | 'stageEnteredAt' | 'stageHistory' | 'checklist' | 'lostReason'
    >
  ) => {
    addOpportunity(data);
  };

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full">
      <PageHeader
        title="Pipeline Comercial"
        subtitle="Gestiona y visualiza el avance de tus oportunidades de venta"
        action={
          <Button color="primary" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Nueva Oportunidad
          </Button>
        }
      />

      {/* Filtros */}
      <SectionCard className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 w-full">
            <Input
              label="Buscar"
              placeholder="Buscar por cliente o contacto..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              leftIcon={<Icon name="Search" size={16} />}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="w-full sm:w-48">
              <SelectField
                label="Origen"
                options={[{ value: '', label: 'Cualquier origen' }, ...ORIGIN_OPTIONS]}
                value={filters.source}
                onChange={(v) => setFilters((p) => ({ ...p, source: v as string }))}
              />
            </div>
            <div className="w-full sm:w-48">
              <SelectField
                label="Producto"
                options={[{ value: '', label: 'Cualquier producto' }, ...MAIN_PRODUCTS]}
                value={filters.mainProduct}
                onChange={(v) => setFilters((p) => ({ ...p, mainProduct: v as string }))}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Kanban */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar mt-2">
        <div
          className="flex flex-col w-full"
          style={{ minWidth: `${stages.length * 260 + (stages.length - 1) * 16}px` }}
        >
          <PipelineChevron stages={stages} />
          <div className="flex gap-4 w-full">
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                opportunities={opportunitiesByStage.get(stage.id) ?? []}
                onCardDrop={handleColumnDrop}
                onOpenPanel={openPanel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drawer nueva oportunidad */}
      <NewOpportunityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveOpportunity}
      />

      {/* Panel lateral de oportunidad */}
      <OpportunityPanel
        opportunityId={selectedId}
        isOpen={isOpen}
        onClose={closePanel}
        daysInStage={daysInStage}
        agingLevel={agingLevel}
      />

      {/* Dialog de cierre */}
      <OutcomeDialog
        open={outcomeDialogOpen}
        clientName={pendingOpportunity?.clientName ?? ''}
        onConfirm={handleOutcomeConfirm}
        onCancel={handleOutcomeCancel}
      />
    </PageContainer>
  );
}
