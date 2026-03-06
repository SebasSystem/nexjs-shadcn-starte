'use client';

import { useMemo } from 'react';
import { Icon, type IconName } from 'src/shared/components/ui';
import type { NavSectionData } from '../components/layouts/dashboard/nav-section';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos provenientes del backend (user.modules)
// ─────────────────────────────────────────────────────────────────────────────
export type BackendNavItem = {
  id: string;
  name: string;
  icon: string;
  path: string;
  order: number;
  itemparentId: string | null;
  permissions: string[];
  moduleId: string;
  children: BackendNavItem[];
};

export type BackendModule = {
  moduleId: string;
  subheader: string;
  order: number;
  items: BackendNavItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de íconos: string del backend → nombre de icono registrado
// ─────────────────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, IconName> = {
  dashboard: 'LayoutDashboard',
  products: 'Package',
  table: 'List',
  stock: 'Layers',
  overview: 'LayoutGrid',
  category: 'Tag',
  warehouse: 'Warehouse',
  inventory: 'BarChart2',
  movements: 'ArrowLeftRight',
  entry: 'LogIn',
  exit: 'LogOut',
  transfer: 'RefreshCcw',
  reservations: 'CalendarDays',
  calendar: 'CalendarDays',
  b2b: 'Users',
  clients: 'Users',
  orders: 'ShoppingCart',
  pricelist: 'DollarSign',
  reports: 'FileText',
  sales: 'TrendingUp',
  Settings: 'Settings',
};

const DEFAULT_ICON_NAME = 'Menu' as const;

function resolveIcon(iconName?: string | null): React.ReactNode {
  const name = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : DEFAULT_ICON_NAME;
  return <Icon name={name} size={18} />;
}

import type { NavItemProps } from '../components/layouts/dashboard/nav-item';

// ─────────────────────────────────────────────────────────────────────────────
// Convertir ítems del backend → formato NavItemProps
// Solo procesa el nivel raíz (sin hijos por ahora);
// si tiene children, usamos el primer nivel de hijos como ítems sueltos bajo el mismo subheader.
// ─────────────────────────────────────────────────────────────────────────────
function convertItems(items: BackendNavItem[]): NavItemProps[] {
  if (!items?.length) return [];

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return sorted.map((item) => ({
    title: item.name,
    path: item.path,
    icon: resolveIcon(item.icon),
    ...(item.children?.length ? { children: convertItems(item.children) } : {}),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export function useNavData(modules?: BackendModule[]): NavSectionData[] {
  return useMemo(() => {
    if (!modules?.length) return [];

    const sorted = [...modules].sort((a, b) => a.order - b.order);

    return sorted.map((mod) => ({
      subheader: mod.subheader,
      items: convertItems(mod.items),
    }));
  }, [modules]);
}
