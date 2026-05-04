'use client';

import Link from 'next/link';
import type { TopTag } from 'src/features/dashboard/types/dashboard.types';
import { paths } from 'src/routes/paths';
import { Chart, useChart } from 'src/shared/components/chart';
import { SectionCard, SectionCardHeader } from 'src/shared/components/layouts/page';

interface Props {
  top_tags: TopTag[];
}

export function CarteraChart({ top_tags }: Props) {
  const chartOptions = useChart({
    labels: top_tags.map((t) => t.name),
    colors: top_tags.map((t) => t.color),
    stroke: { show: false },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    plotOptions: { pie: { donut: { size: '70%' } } },
    tooltip: { y: { formatter: (val: number) => `${val} contactos` } },
  });

  return (
    <SectionCard>
      <SectionCardHeader
        title="Distribución de Cartera"
        subtitle="Contactos por Etiqueta (Tags)"
        action={
          <Link href={paths.settings.tags}>
            <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Gestionar Etiquetas →
            </button>
          </Link>
        }
      />
      {top_tags.length > 0 ? (
        <div className="flex justify-center items-center mt-2 -mb-2">
          <Chart
            type="donut"
            series={top_tags.map((t) => t.usage_count)}
            options={chartOptions}
            height={260}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
          Sin etiquetas configuradas
        </div>
      )}
    </SectionCard>
  );
}
