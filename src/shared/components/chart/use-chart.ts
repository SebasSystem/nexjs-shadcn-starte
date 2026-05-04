'use client';

import type { ApexOptions } from 'apexcharts';
import { merge } from 'es-toolkit';
import { useTheme } from 'next-themes';
import { useUiStore } from 'src/store/ui.store';

export function useChart(options?: ApexOptions): ApexOptions {
  const { resolvedTheme } = useTheme();
  const colorPreset = useUiStore((state) => state.colorPreset);

  const isDark = resolvedTheme === 'dark';

  // CSS variables (especially modern oklch) a veces dan problemas en Canvas rendering (ApexCharts),
  // por lo que generamos un mapa HEX seguro, alineado con nuestros Tailwind vars.
  const COLORS = {
    text: isDark ? '#919EAB' : '#637381',
    border: isDark ? 'rgba(145, 158, 171, 0.16)' : 'rgba(145, 158, 171, 0.24)',
    background: isDark ? '#141A21' : '#FFFFFF',

    indigo: '#4F46E5',
    cyan: '#06B6D4',
    teal: '#14B8A6',
    purple: '#9333EA',
    rose: '#E11D48',
    orange: '#EA580C',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const primaryColor = COLORS[colorPreset as keyof typeof COLORS] || COLORS.indigo;

  const baseOptions: ApexOptions = {
    // ── Colores base globales ──────────────────────────────────────────────
    colors: [primaryColor, COLORS.info, COLORS.warning, COLORS.error, COLORS.success],

    // ── Config general ─────────────────────────────────────────────────────
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: COLORS.text,
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },

    // ── Tooltip interactivo ────────────────────────────────────────────────
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },

    // ── Leyenda ─────────────────────────────────────────────────────────────
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      markers: {},
      fontWeight: 500,
      itemMargin: { horizontal: 8, vertical: 8 },
      labels: { colors: COLORS.text },
    },

    // ── Cuadrícula de fondo ────────────────────────────────────────────────
    grid: {
      strokeDashArray: 3,
      borderColor: COLORS.border,
      xaxis: { lines: { show: false } },
    },

    // ── Ejes X e Y ─────────────────────────────────────────────────────────
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: COLORS.text } },
    },
    yaxis: {
      labels: { style: { colors: COLORS.text } },
    },

    // ── Líneas y marcadores ────────────────────────────────────────────────
    stroke: { width: 3, curve: 'smooth', lineCap: 'round' },
    markers: {
      size: 0,
      strokeColors: COLORS.background,
      strokeWidth: 2,
    },

    // ── Estilo interno (barras, donas, etc.) ───────────────────────────────
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '28%' },
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              color: isDark ? '#FFF' : '#212B36',
              fontSize: '24px',
              fontWeight: 700,
            },
            total: {
              show: true,
              label: 'Total',
              color: COLORS.text,
              fontSize: '14px',
              fontWeight: 600,
            },
          },
        },
      },
    },

    // ── DataLabels y states ────────────────────────────────────────────────
    dataLabels: { enabled: false },
    states: {
      hover: { filter: { type: 'darken' } },
      active: { filter: { type: 'darken' } },
    },
  };

  // Mezcla profunda de base + las configuraciones locales que mande el frontend dev
  return merge(baseOptions, options || {}) as ApexOptions;
}
