'use client';

import { Icon, type IconName } from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────
const KPIS: {
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  icon: IconName;
  iconBg: string;
}[] = [
  {
    label: 'Unidades totales',
    value: '2,847',
    badge: '+12%',
    badgeColor: 'text-emerald-600 bg-emerald-50',
    icon: 'Package',
    iconBg: 'bg-blue-50 text-blue-500',
  },
  {
    label: 'Stock disponible venta',
    value: '2,412',
    badge: 'Disponible',
    badgeColor: 'text-emerald-600 bg-emerald-50',
    icon: 'ShieldCheck',
    iconBg: 'bg-emerald-50 text-emerald-500',
  },
  {
    label: 'Stock reservado',
    value: '435',
    badge: 'B2B',
    badgeColor: 'text-blue-600 bg-blue-50',
    icon: 'BarChart2',
    iconBg: 'bg-purple-50 text-purple-500',
  },
  {
    label: 'Productos stock bajo',
    value: '8',
    badge: 'ALERTA',
    badgeColor: 'text-amber-600 bg-amber-50',
    icon: 'AlertTriangle',
    iconBg: 'bg-amber-50 text-amber-500',
  },
];

const BODEGAS = [
  { name: 'Bodega Principal', units: '1,892 unidades', pct: 66, color: 'bg-indigo-500' },
  { name: 'Tienda', units: '955 unidades', pct: 34, color: 'bg-emerald-500' },
];

const RESERVAS = [
  {
    initials: 'DM',
    color: 'bg-blue-100 text-blue-700',
    name: 'Distribuidora Mayorista',
    cod: 'COT-2024-0166',
    uds: '150 uds',
    time: 'Hace 2h',
  },
  {
    initials: 'RC',
    color: 'bg-rose-100 text-rose-700',
    name: 'Retail Corp',
    cod: 'COT-2024-0165',
    uds: '85 uds',
    time: 'Hace 5h',
  },
  {
    initials: 'SN',
    color: 'bg-amber-100 text-amber-700',
    name: 'Super Norte',
    cod: 'COT-2024-0164',
    uds: '200 uds',
    time: 'Hace 1d',
  },
];

const STOCK_BAJO = [
  {
    emoji: '👕',
    name: 'Camiseta Básica XL',
    sku: 'SKU-001-XL',
    actual: 3,
    minimo: 25,
    estado: 'CRÍTICO',
    estadoColor: 'bg-red-100 text-red-600',
  },
  {
    emoji: '👟',
    name: 'Zapatilla Running 42',
    sku: 'SKU-045-42',
    actual: 8,
    minimo: 20,
    estado: 'BAJO',
    estadoColor: 'bg-amber-100 text-amber-600',
  },
  {
    emoji: '🧢',
    name: 'Gorra Deportiva Negra',
    sku: 'SKU-089-BK',
    actual: 12,
    minimo: 30,
    estado: 'BAJO',
    estadoColor: 'bg-amber-100 text-amber-600',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function DashboardView() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard de Inventario</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vista general del stock disponible</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2 rounded-lg', kpi.iconBg)}>
                  <Icon name={kpi.icon} size={18} />
                </div>
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                    kpi.badgeColor
                  )}
                >
                  {kpi.badge}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Middle row: Stock por Bodega + Reservas B2B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock por Bodega */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Stock por Bodega</h2>
            <button className="text-xs text-indigo-600 font-medium hover:underline">
              Ver detalle
            </button>
          </div>
          <div className="space-y-4">
            {BODEGAS.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.units}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{b.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', b.color)}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reservas B2B Recientes */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Reservas B2B Recientes</h2>
            <button className="text-xs text-indigo-600 font-medium hover:underline">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {RESERVAS.map((r) => (
              <div
                key={r.cod}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'size-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0',
                      r.color
                    )}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.cod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{r.uds}</p>
                  <p className="text-xs text-slate-400">{r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} className="text-amber-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Productos con Stock Bajo</h2>
              <p className="text-xs text-slate-400">Requieren atención inmediata</p>
            </div>
          </div>
          <button className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="text-left px-5 py-3">Producto</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-right px-5 py-3">Stock actual</th>
                <th className="text-right px-5 py-3">Mínimo</th>
                <th className="text-right px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STOCK_BAJO.map((p) => (
                <tr key={p.sku} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.emoji}</span>
                      <span className="font-medium text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-700">
                    {p.actual}
                  </td>
                  <td className="px-5 py-3.5 text-right text-indigo-600 font-semibold">
                    {p.minimo}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2.5 py-1 rounded-full',
                        p.estadoColor
                      )}
                    >
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
