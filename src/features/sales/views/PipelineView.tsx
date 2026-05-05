'use client';

import { useState } from 'react';
import { useIntelligence } from 'src/features/intelligence/hooks/useIntelligence';
import type { LostReasonInfo } from 'src/features/sales/types/sales.types';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

import {
  NewOpportunityDrawer,
  type NewOpportunityPayload,
} from '../components/NewOpportunityDrawer';
import { OpportunityPanel } from '../components/OpportunityPanel';
import { OutcomeDialog } from '../components/OutcomeDialog';
import { PipelineChevron } from '../components/PipelineChevron';
import { PipelineColumn } from '../components/PipelineColumn';
import { useSalesContext } from '../context/SalesContext';
import { useOpportunityPanel } from '../hooks/useOpportunityPanel';
import { usePipeline } from '../hooks/usePipeline';

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
  const [pendingMove, setPendingMove] = useState<{ oppUid: string } | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);

  const { stages, opportunitiesByStage, search, setSearch } = usePipeline();
  const { addOpportunity, moveOpportunity, opportunities } = useSalesContext();
  const { competitors = [] } = useIntelligence();
  const { selectedId, isOpen, openPanel, closePanel, daysInStage, agingLevel } =
    useOpportunityPanel();

  const pendingOpportunity = pendingMove
    ? opportunities.find((o) => o.uid === pendingMove.oppUid)
    : undefined;

  const handleColumnDrop = (oppUid: string, targetStageUid: string) => {
    const targetStage = stages.find((s) => s.uid === targetStageUid);
    const isTerminal = targetStage?.is_won || targetStage?.is_lost;
    if (isTerminal) {
      setPendingMove({ oppUid });
      setOutcomeDialogOpen(true);
    } else {
      moveOpportunity(oppUid, targetStageUid);
    }
  };

  const handleOutcomeConfirm = async (
    outcome: 'ganado' | 'perdido',
    _lostReason?: LostReasonInfo
  ) => {
    if (!pendingMove) return;
    // Find the appropriate terminal stage UID
    const terminalStage = stages.find((s) => (outcome === 'ganado' ? s.is_won : s.is_lost));
    const stageUid = terminalStage?.uid;
    if (stageUid) {
      await moveOpportunity(pendingMove.oppUid, stageUid);
    }
    // TODO: persist lostReason via lost-opportunity API endpoint when available
    setOutcomeDialogOpen(false);
    setPendingMove(null);
  };

  const handleOutcomeCancel = () => {
    setOutcomeDialogOpen(false);
    setPendingMove(null);
  };

  const handleSaveOpportunity = (data: NewOpportunityPayload) => {
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="Search" size={16} />}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="w-full sm:w-48">
              <SelectField
                label="Origen"
                options={[{ value: '', label: 'Cualquier origen' }, ...ORIGIN_OPTIONS]}
                value=""
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="w-full sm:w-48">
              <SelectField
                label="Producto"
                options={[{ value: '', label: 'Cualquier producto' }, ...MAIN_PRODUCTS]}
                value=""
                onChange={() => {}}
                disabled
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
                key={stage.uid}
                stage={stage}
                stages={stages}
                opportunities={opportunitiesByStage.get(stage.uid) ?? []}
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
        stages={stages}
      />

      {/* Panel lateral de oportunidad */}
      <OpportunityPanel
        opportunityId={selectedId}
        isOpen={isOpen}
        onClose={closePanel}
        daysInStage={daysInStage}
        agingLevel={agingLevel}
        stages={stages}
      />

      {/* Dialog de cierre */}
      <OutcomeDialog
        open={outcomeDialogOpen}
        clientName={pendingOpportunity?.title ?? ''}
        competitors={competitors}
        onConfirm={handleOutcomeConfirm}
        onCancel={handleOutcomeCancel}
      />
    </PageContainer>
  );
}
