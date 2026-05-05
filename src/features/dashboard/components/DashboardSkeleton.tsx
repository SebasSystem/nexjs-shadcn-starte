'use client';

import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Table, TableBody, TableContainer, TableSkeleton } from 'src/shared/components/table';
import { StatsCardSkeleton } from 'src/shared/components/ui';

function PulseRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/40">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="h-8 w-8 rounded-lg bg-muted/50 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted/40 rounded animate-pulse" />
          </div>
          <div className="h-3 w-12 bg-muted/40 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-h6 text-foreground mb-1">{title}</h2>
      {subtitle && <p className="text-body2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle="Descripción general del sistema" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Cartera + Tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard>
          <SectionTitle title="Distribución de Cartera" subtitle="Contactos por Etiqueta (Tags)" />
          <div className="h-[220px] bg-muted/40 rounded-xl animate-pulse" />
        </SectionCard>
        <SectionCard noPadding>
          <div className="px-5 pt-5 pb-4">
            <SectionTitle title="Tareas Vencidas Hoy" />
          </div>
          <PulseRows count={4} />
        </SectionCard>
      </div>

      {/* Ventas chart */}
      <SectionCard>
        <SectionTitle title="Rendimiento de Ventas" subtitle="Ingresos por mes" />
        <div className="h-[260px] bg-muted/40 rounded-xl animate-pulse" />
      </SectionCard>

      {/* Stock bajo */}
      <SectionCard noPadding>
        <div className="px-5 pt-5 pb-4">
          <SectionTitle title="Productos con Stock Bajo" />
        </div>
        <TableContainer>
          <Table>
            <TableBody emptyContent={false}>
              <TableSkeleton rows={4} columns={5} />
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* Cotizaciones */}
      <SectionCard noPadding>
        <div className="px-5 pt-5 pb-4">
          <SectionTitle
            title="Últimas Cotizaciones"
            subtitle="Cotizaciones creadas recientemente"
          />
        </div>
        <TableContainer>
          <Table>
            <TableBody emptyContent={false}>
              <TableSkeleton rows={4} columns={5} />
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* Actividades */}
      <SectionCard noPadding>
        <div className="px-5 pt-5 pb-4">
          <SectionTitle title="Actividades Recientes" subtitle="Últimas actividades del equipo" />
        </div>
        <PulseRows count={5} />
      </SectionCard>
    </PageContainer>
  );
}
