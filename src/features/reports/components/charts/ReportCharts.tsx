'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function BarChart({
  series,
  categories,
  horizontal = false,
  stacked = false,
}: {
  series: { name: string; data: number[] }[];
  categories: string[];
  horizontal?: boolean;
  stacked?: boolean;
}) {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      stacked,
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 2,
        dataLabels: { position: 'top' },
        columnWidth: '65%',
        barHeight: '75%',
      },
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    dataLabels: { enabled: false },
    xaxis: { categories },
    legend: { position: 'top', horizontalAlign: 'left' },
    grid: { padding: { left: 0, right: 0, bottom: -10, top: 0 } },
  };
  return <Chart options={options} series={series} type="bar" height="100%" width="100%" />;
}

export function DonutChart({
  series,
  labels,
  colors,
}: {
  series: number[];
  labels: string[];
  colors?: string[];
}) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels,
    colors: colors || ['#ef4444', '#f97316', '#eab308', '#10b981'],
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '13px', color: '#888' },
            value: { show: true, fontSize: '24px', fontWeight: 'bold' },
            total: { show: true, label: 'Total', color: '#888' },
          },
        },
      },
    },
    legend: { position: 'bottom' },
  };
  return <Chart options={options} series={series} type="donut" height="100%" width="100%" />;
}

export function LineChart({
  series,
  categories,
}: {
  series: { name: string; data: number[] }[];
  categories: string[];
}) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, fontFamily: 'inherit', parentHeightOffset: 0 },
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories },
    legend: { position: 'top' },
    grid: { padding: { left: 5, right: 5, bottom: -10, top: 0 } },
  };
  return <Chart options={options} series={series} type="line" height="100%" width="100%" />;
}

export function AreaChart({
  series,
  categories,
}: {
  series: { name: string; data: number[] }[];
  categories: string[];
}) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', parentHeightOffset: 0 },
    colors: ['#8b5cf6', '#f59e0b', '#3b82f6', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories },
    legend: { position: 'top' },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
    grid: { padding: { left: 0, right: 0, bottom: -10, top: 0 } },
  };
  return <Chart options={options} series={series} type="area" height="100%" width="100%" />;
}
