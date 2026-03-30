'use client';

import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Plus, DatabaseZap, Users, Filter, Briefcase } from 'lucide-react';
import { useSegments } from '../hooks/use-segments';
import { SegmentsTable } from '../components/segments/segments-table';
import { SegmentBuilderDrawer } from '../components/segments/segment-builder-drawer';
import type { Segment, SegmentForm } from '../types/segments.types';

export const SegmentsView = () => {
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

  const handleRun = (segment: Segment) => {
    alert(
      `Ejecutando Segmento: ${segment.nombre}\nBuscando en la base de datos... Se encontraron ${segment.totalContactos} registros coincidentes.`
    );
  };

  const handleSave = async (form: SegmentForm): Promise<boolean> => {
    if (selectedSegment) return updateSegment(selectedSegment.id, form);
    return createSegment(form);
  };

  // Métricas analíticas básicas agregadas de la base de segmentos (Mock para Dashboard Analítico)
  const totalSaved = segments.length;
  const totalAudience = segments.reduce((sum, s) => sum + s.totalContactos, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Motor de Segmentación y Audiencias"
        subtitle="Construye consultas dinámicas sobre tu base de datos y guarda grupos de clientes para campañas o análisis rápido."
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Segmento Dinámico
          </Button>
        }
      />

      {/* DASHBOARD ANALÍTICO CORE BÁSICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatsCard
          title="Segmentos Guardados"
          value={totalSaved.toString()}
          icon={<Filter className="h-5 w-5 text-blue-500" />}
          trend="+12% este mes"
        />
        <StatsCard
          title="Audiencia Total Indexada"
          value={totalAudience.toLocaleString()}
          icon={<Users className="h-5 w-5 text-emerald-500" />}
          trend="+5.2% crecimiento mensual"
        />
        <StatsCard
          title="Velocidad Media de Query"
          value="42ms"
          icon={<DatabaseZap className="h-5 w-5 text-orange-500" />}
          trend="Rendimiento del motor GIN"
        />
      </div>

      <SectionCard noPadding>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/10">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Vistas y Segmentos Disponibles
          </div>
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
              <DatabaseZap className="h-12 w-12 text-primary opacity-80" />
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
            onRun={handleRun}
          />
        )}
      </SectionCard>

      <SegmentBuilderDrawer
        key={isDrawerOpen ? (selectedSegment?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        segment={selectedSegment}
        onSave={handleSave}
      />
    </PageContainer>
  );
};
