'use client';

import type { MonthlySalesPoint } from 'src/features/dashboard/types/dashboard.types';
import { Chart, useChart } from 'src/shared/components/chart';
import { SectionCard, SectionCardHeader } from 'src/shared/components/layouts/page';

interface Props {
  monthly_sales: MonthlySalesPoint[];
}

export function SalesPerformanceChart({ monthly_sales }: Props) {
  const hasGoals = monthly_sales.some((p) => p.goal !== null);

  const series = [
    {
      name: 'Ingresos Reales',
      type: 'column' as const,
      data: monthly_sales.map((p) => p.actual),
    },
    ...(hasGoals
      ? [
          {
            name: 'Meta Proyectada',
            type: 'line' as const,
            data: monthly_sales.map((p) => p.goal ?? 0),
          },
        ]
      : []),
  ];

  const chartOptions = useChart({
    stroke: { width: hasGoals ? [0, 3] : [0] },
    plotOptions: { bar: { columnWidth: '20%', borderRadius: 4 } },
    fill: { type: hasGoals ? ['solid', 'solid'] : ['solid'] },
    colors: hasGoals ? ['#3B82F6', '#10B981'] : ['#3B82F6'],
    labels: monthly_sales.map((p) => p.label),
    xaxis: { type: 'category' },
    yaxis: { labels: { formatter: (val: number) => `$${(val / 1000).toFixed(0)}k` } },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `$${val.toLocaleString('es-AR')}` },
    },
  });

  if (monthly_sales.length === 0) return null;

  return (
    <SectionCard>
      <SectionCardHeader
        title="Rendimiento de Ventas"
        subtitle={hasGoals ? 'Ingresos Reales vs. Meta Proyectada' : 'Ingresos por mes'}
      />
      <div className="mt-2">
        <Chart type="line" series={series} options={chartOptions} height={320} />
      </div>
    </SectionCard>
  );
}
