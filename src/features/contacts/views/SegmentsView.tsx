'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { SegmentBuilderDrawer } from '../components/segments/segment-builder-drawer';
import { SegmentsTable } from '../components/segments/segments-table';
import { useSegments } from '../hooks/use-segments';
import type { Segment, SegmentPayload } from '../types/segments.types';

export const SegmentsView = () => {
  const router = useRouter();
  const { segments, isLoading, createSegment, updateSegment, deleteSegment } = useSegments();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const handleOpenNew = () => {
    setSelectedSegment(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (segment: Segment) => {
    setSelectedSegment(segment);
    setIsDrawerOpen(true);
  };

  const handleView = (segment: Segment) => {
    router.push(`/contacts?segment=${segment.uid}`);
  };

  const handleSave = async (payload: SegmentPayload): Promise<boolean> => {
    if (selectedSegment) return updateSegment(selectedSegment.uid, payload);
    return createSegment(payload);
  };

  // Métricas analíticas básicas agregadas de la base de segmentos
  const totalSaved = segments.length;
  const totalAudience = segments.reduce((sum, s) => sum + s.total_contacts, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Motor de Segmentación y Audiencias"
        subtitle="Construye consultas dinámicas sobre tu base de datos y guarda grupos de clientes para campañas o análisis rápido."
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" className="h-4 w-4" />
            Crear Segmento Dinámico
          </Button>
        }
      />

      {/* DASHBOARD ANALÍTICO CORE BÁSICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatsCard
          title="Segmentos Guardados"
          value={totalSaved.toString()}
          icon={<Icon name="Filter" className="h-5 w-5 text-blue-500" />}
          trend="del total de contactos"
        />
        <StatsCard
          title="Audiencia Total Indexada"
          value={totalAudience.toLocaleString()}
          icon={<Icon name="Users" className="h-5 w-5 text-emerald-500" />}
          trend="del total de contactos"
        />
        <StatsCard
          title="Velocidad Media de Query"
          value="—"
          icon={<Icon name="DatabaseZap" className="h-5 w-5 text-orange-500" />}
          trend="Rendimiento del motor GIN"
        />
      </div>

      <SectionCard noPadding>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-h6 text-foreground">Vistas y Segmentos Disponibles</p>
        </div>

        {isLoading && segments.length === 0 ? (
          <div className="p-8 flex flex-col gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary/10 p-5 rounded-full mb-4">
              <Icon name="DatabaseZap" className="h-12 w-12 text-primary opacity-80" />
            </div>
            <h3 className="text-h6 text-foreground font-semibold mb-2">
              Base de datos sin segmentar
            </h3>
            <p className="text-body2 text-muted-foreground max-w-sm mb-6">
              El motor de búsqueda dinámica te permite cruzar múltiples variables (etiquetas,
              montos, tipos) bajo condiciones &quot;Y/O&quot;.
            </p>
            <Button color="primary" onClick={handleOpenNew}>
              Ejecutar primera consulta
            </Button>
          </div>
        ) : (
          <SegmentsTable
            segments={segments}
            onEdit={handleEdit}
            onDelete={deleteSegment}
            onView={handleView}
          />
        )}
      </SectionCard>

      <SegmentBuilderDrawer
        key={isDrawerOpen ? (selectedSegment?.uid ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        segment={selectedSegment}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
