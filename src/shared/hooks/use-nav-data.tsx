'use client';

import { useMemo } from 'react';
import { paths } from 'src/routes/paths';
import { Icon, type IconName } from 'src/shared/components/ui';

import type { NavItemProps } from '../components/layouts/dashboard/nav-item';
import type { NavSectionData } from '../components/layouts/dashboard/nav-section';

// ─────────────────────────────────────────────────────────────────────────────
// Static nav config — each item optionally requires a permission key.
// Items without requiredPermission are always visible.
// ─────────────────────────────────────────────────────────────────────────────
type StaticNavItem = {
  title: string;
  path: string;
  icon: IconName;
  requiredPermission?: string;
  children?: StaticNavItem[];
};

type StaticSection = {
  subheader: string;
  requiredPermission?: string;
  items: StaticNavItem[];
};

const NAV_CONFIG: StaticSection[] = [
  {
    subheader: 'General',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: 'LayoutDashboard',
        requiredPermission: 'dashboard.read',
      },
    ],
  },
  {
    subheader: 'Comercial',
    items: [
      {
        title: 'Pipeline',
        path: paths.sales.pipeline,
        icon: 'TrendingUp',
        requiredPermission: 'opportunities.read',
      },
      {
        title: 'Contactos',
        path: paths.contacts.root,
        icon: 'Users',
        requiredPermission: 'contacts.read',
      },
      {
        title: 'Proyectos',
        path: paths.projects.root,
        icon: 'FolderKanban',
        requiredPermission: 'crm-entities.read',
      },
      {
        title: 'Partners',
        path: paths.partners.root,
        icon: 'Handshake',
        requiredPermission: 'crm-entities.read',
      },
      {
        title: 'Finanzas',
        path: paths.sales.finance.root,
        icon: 'DollarSign',
        requiredPermission: 'finance.read',
        children: [
          { title: 'Cotizaciones', path: paths.sales.finance.quotation, icon: 'FileText' },
          { title: 'Facturas', path: paths.sales.finance.invoice, icon: 'FileText' },
          {
            title: 'Reglas de crédito',
            path: paths.sales.finance.creditRules,
            icon: 'ShieldCheck',
          },
          { title: 'Multi-moneda', path: paths.sales.finance.multiCurrency, icon: 'Globe' },
        ],
      },
    ],
  },
  {
    subheader: 'Inventario',
    items: [
      {
        title: 'Productos',
        path: paths.inventory.products,
        icon: 'Package',
        requiredPermission: 'inventory.read',
      },
      {
        title: 'Stock',
        path: paths.inventory.stock,
        icon: 'Layers',
        requiredPermission: 'inventory.read',
      },
      {
        title: 'Bodegas',
        path: paths.inventory.warehouses.root,
        icon: 'Warehouse',
        requiredPermission: 'inventory.read',
      },
      {
        title: 'Movimientos',
        path: paths.inventory.warehouses.movements,
        icon: 'ArrowLeftRight',
        requiredPermission: 'inventory.read',
      },
    ],
  },
  {
    subheader: 'Reportes',
    items: [
      {
        title: 'Inventario',
        path: paths.reports.inventory,
        icon: 'PieChart',
        requiredPermission: 'inventory.report',
      },
      {
        title: 'Ventas',
        path: paths.reports.sales,
        icon: 'BarChart2',
        requiredPermission: 'opportunities.read',
      },
    ],
  },
  {
    subheader: 'Inteligencia',
    items: [
      {
        title: 'Battlecards',
        path: paths.intelligence.battlecards,
        icon: 'Swords',
        requiredPermission: 'crm-entities.read',
      },
      {
        title: 'Razones de pérdida',
        path: paths.intelligence.lostReasons,
        icon: 'TrendingDown',
        requiredPermission: 'opportunities.read',
      },
    ],
  },
  {
    subheader: 'Automatización',
    items: [
      {
        title: 'Reglas',
        path: paths.automation.rules,
        icon: 'Zap',
        requiredPermission: 'crm-entities.manage',
      },
      {
        title: 'Asignación',
        path: paths.automation.assignment,
        icon: 'UserCheck',
        requiredPermission: 'crm-entities.manage',
      },
    ],
  },
  {
    subheader: 'Agenda',
    items: [
      {
        title: 'Calendario',
        path: paths.schedule.root,
        icon: 'CalendarDays',
        requiredPermission: 'activities.read',
      },
    ],
  },
  {
    subheader: 'RR.HH.',
    items: [
      {
        title: 'Comisiones',
        path: paths.hr.commissions.root,
        icon: 'CreditCard',
        requiredPermission: 'commissions.read',
        children: [
          { title: 'Planes', path: paths.hr.commissions.plans, icon: 'ClipboardList' },
          { title: 'Asignación', path: paths.hr.commissions.assignment, icon: 'UserCheck' },
          { title: 'Dashboard', path: paths.hr.commissions.dashboard, icon: 'LayoutDashboard' },
          { title: 'Historial', path: paths.hr.commissions.history, icon: 'List' },
        ],
      },
    ],
  },
  {
    subheader: 'Configuración',
    items: [
      {
        title: 'Usuarios',
        path: paths.settings.users,
        icon: 'Users',
        requiredPermission: 'users.manage',
      },
      {
        title: 'Roles',
        path: paths.settings.roles,
        icon: 'ShieldCheck',
        requiredPermission: 'users.manage',
      },
      {
        title: 'Equipos',
        path: paths.settings.teams,
        icon: 'Users',
        requiredPermission: 'users.manage',
      },
      {
        title: 'Etiquetas',
        path: paths.settings.tags,
        icon: 'Tag',
        requiredPermission: 'tags.manage',
      },
    ],
  },
  {
    subheader: 'Admin SaaS',
    items: [
      {
        title: 'Dashboard',
        path: paths.admin.dashboard,
        icon: 'LayoutDashboard',
        requiredPermission: 'admin.dashboard.read',
      },
      {
        title: 'Tenants',
        path: paths.admin.tenants,
        icon: 'Building2',
        requiredPermission: 'admin.tenants.manage',
      },
      {
        title: 'Planes',
        path: paths.admin.plans,
        icon: 'CreditCard',
        requiredPermission: 'plans.manage',
      },
      {
        title: 'Facturación',
        path: paths.admin.billing,
        icon: 'Activity',
        requiredPermission: 'admin.billing.manage',
      },
      {
        title: 'Telemetría',
        path: paths.admin.telemetry,
        icon: 'BarChart3',
        requiredPermission: 'admin.telemetry.read',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Build NavItemProps from static config, filtering by permissions
// ─────────────────────────────────────────────────────────────────────────────
function buildNavItems(
  items: StaticNavItem[],
  hasPermission: (key: string) => boolean
): NavItemProps[] {
  return items
    .filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission))
    .map((item) => ({
      title: item.title,
      path: item.path,
      icon: <Icon name={item.icon} size={18} />,
      ...(item.children?.length ? { children: buildNavItems(item.children, hasPermission) } : {}),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export function useNavData(
  hasPermission: (key: string) => boolean = () => true,
  permissions: string[] = []
): NavSectionData[] {
  const isSuperAdmin = permissions.some((p) => p.startsWith('admin.'));

  return useMemo(() => {
    const sections = isSuperAdmin
      ? NAV_CONFIG.filter((section) => section.subheader === 'Admin SaaS')
      : NAV_CONFIG;

    return sections
      .map((section) => ({
        subheader: section.subheader,
        items: buildNavItems(section.items, hasPermission),
      }))
      .filter((section) => section.items.length > 0);
  }, [hasPermission, isSuperAdmin]);
}

// Keep BackendModule export for any lingering imports (no-op compatibility shim)
export type BackendModule = Record<string, unknown>;
export type BackendNavItem = Record<string, unknown>;
