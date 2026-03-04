// ─────────────────────────────────────────────────────────────────────────────
// Icon — Componente centralizado de iconos
// ─────────────────────────────────────────────────────────────────────────────

import {
  // ── Navegación ──────────────────────────────────────────────────────────────
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  Check,
  PanelLeft,
  PanelBottom,
  StretchHorizontal,
  ALargeSmall,
  Circle,
  Contrast,
  Box,
  Layers,
  LayoutGrid,
  LayoutTemplate,

  // ── Auth / Seguridad ────────────────────────────────────────────────────────
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  User,

  // ── Negocio / Módulos ───────────────────────────────────────────────────────
  Package,
  List,
  Tag,
  Warehouse,
  BarChart2,
  ArrowLeftRight,
  LogIn,
  LogOut,
  RefreshCcw,
  CalendarDays,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertTriangle,
  Shirt,
  Footprints,
  SunSnow,

  // ── UI / Feedback ───────────────────────────────────────────────────────────
  Cloud,
  Globe,
  Info,
  type LucideIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Registro de iconos (implementación interna — no exportado)
// Para agregar un nuevo ícono: importarlo arriba y añadirlo aquí.
// ─────────────────────────────────────────────────────────────────────────────
const icons = {
  // Navegación
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  Check,
  PanelLeft,
  PanelBottom,
  StretchHorizontal,
  ALargeSmall,
  Circle,
  Contrast,
  Box,
  Layers,
  LayoutGrid,
  LayoutTemplate,

  // Auth
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  User,

  // Negocio
  Package,
  List,
  Tag,
  Warehouse,
  BarChart2,
  ArrowLeftRight,
  LogIn,
  LogOut,
  RefreshCcw,
  CalendarDays,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertTriangle,
  Shirt,
  Footprints,
  SunSnow,

  // UI
  Cloud,
  Globe,
  Info,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export type IconName = keyof typeof icons;

export type { LucideIcon };

// ─────────────────────────────────────────────────────────────────────────────
// Componente <Icon />
//
// Uso:
//   <Icon name="Mail" size={16} />
//   <Icon name="ChevronRight" className="text-primary" />
// ─────────────────────────────────────────────────────────────────────────────
interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth, className }: IconProps) {
  const LucideIconComponent: LucideIcon = icons[name];
  return <LucideIconComponent size={size} strokeWidth={strokeWidth} className={className} />;
}
