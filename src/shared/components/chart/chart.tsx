'use client';

import dynamic from 'next/dynamic';
import { type Props as ApexChartProps } from 'react-apexcharts';
import { cn } from 'src/lib/utils';
import { memo } from 'react';

// SSR must be false because ApexCharts uses Window directly
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent" />,
});

export interface ChartProps extends ApexChartProps {
  className?: string;
}

function ChartComponent({
  className,
  type = 'line',
  series,
  options,
  width = '100%',
  height = 320,
  ...other
}: ChartProps) {
  return (
    <div
      dir="ltr"
      className={cn(
        'relative w-full z-0',
        /* Basic overrides for ApexCharts inner tags to use Tailwind CSS vars */
        '[&_.apexcharts-tooltip]:shadow-dialog [&_.apexcharts-tooltip]:border-border/50 [&_.apexcharts-tooltip]:rounded-2xl [&_.apexcharts-tooltip]:overflow-hidden',
        '[&_.apexcharts-tooltip-title]:bg-muted/50 [&_.apexcharts-tooltip-title]:font-semibold [&_.apexcharts-tooltip-title]:px-3 [&_.apexcharts-tooltip-title]:py-2',
        '[&_.apexcharts-legend-text]:text-muted-foreground [&_.apexcharts-legend-text]:font-medium',
        '[&_.apexcharts-gridline]:stroke-border/40',
        className
      )}
    >
      <ReactApexChart
        type={type}
        series={series}
        options={options}
        width={width}
        height={height}
        {...other}
      />
    </div>
  );
}

export const Chart = memo(ChartComponent);
