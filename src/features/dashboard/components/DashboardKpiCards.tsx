'use client';

import type { DashboardCoreData } from 'src/features/dashboard/types/dashboard.types';
import { formatMoney } from 'src/lib/currency';
import { Chart, useChart } from 'src/shared/components/chart';
import { Icon } from 'src/shared/components/ui';

interface Props {
  data: DashboardCoreData;
}

export function DashboardKpiCards({ data }: Props) {
  const sparklineOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    plotOptions: {
      bar: { columnWidth: '75%', borderRadius: 2, borderRadiusApplication: 'end' },
    },
    yaxis: { show: false, labels: { show: false } },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
      marker: { show: false },
    },
  });

  const kpis = [
    {
      label: 'Total Contactos',
      value: data.totals.contacts.toLocaleString('es-AR'),
      trendLabel: `+${data.breakdown.contacts_created_today} hoy`,
      trendUp: true,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, data.totals.contacts],
    },
    {
      label: 'Tasa de Conversión',
      value: data.kpis.conversion_rate > 0 ? `${data.kpis.conversion_rate}%` : '--',
      trendLabel: 'Pipeline activo',
      trendUp: true,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, data.kpis.conversion_rate],
    },
    {
      label: 'MRR Proyectado',
      value: data.kpis.mrr > 0 ? formatMoney(data.kpis.mrr, { maximumFractionDigits: 0 }) : '--',
      trendLabel: 'Este mes',
      trendUp: true,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, data.kpis.mrr],
    },
    {
      label: 'Clientes en Riesgo',
      value: data.kpis.at_risk_count.toLocaleString('es-AR'),
      trendLabel: 'Requieren acción',
      trendUp: false,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, data.kpis.at_risk_count],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="group bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col justify-between"
        >
          <p className="text-sm font-semibold text-foreground mb-4">{kpi.label}</p>

          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>
            <div className="w-[84px] h-[48px] shrink-0">
              <Chart
                type="bar"
                series={[{ data: kpi.chartData }]}
                options={{
                  ...sparklineOptions,
                  colors: [kpi.trendUp ? '#10B981' : '#EF4444'],
                }}
                height={48}
                width="100%"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <Icon
              name={kpi.trendUp ? 'TrendingUp' : 'TrendingDown'}
              size={16}
              className={kpi.trendUp ? 'text-success' : 'text-error'}
            />
            <span className="text-sm font-medium text-muted-foreground">{kpi.trendLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
