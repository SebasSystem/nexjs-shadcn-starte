// ─────────────────────────────────────────────────────────────────────────────
// Icon — Componente centralizado de iconos
// ─────────────────────────────────────────────────────────────────────────────

import {
  // ── Navegación ──────────────────────────────────────────────────────────────
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
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
  ExternalLink,

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
  Tags,
  Warehouse,
  BarChart2,
  BarChart3,
  ArrowLeftRight,
  LogIn,
  LogOut,
  RefreshCcw,
  RefreshCw,
  CalendarDays,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  FileDown,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Shirt,
  Footprints,
  SunSnow,
  PieChart,
  PackageOpen,
  Briefcase,
  Receipt,
  Landmark,
  Languages,
  Globe,
  Phone,
  PhoneCall,
  MapPin,
  Link2,
  Unlink,
  Bell,
  HardDrive,
  DatabaseZap,
  Filter,

  // ── Acciones ──────────────────────────────────────────────────────────────
  Search,
  Plus,
  PlusCircle,
  Pencil,
  Edit,
  Edit2,
  SquarePen,
  Trash2,
  Download,
  Upload,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Store,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  XCircle,
  UserPlus,
  UserX,
  UserCheck,
  Clock,
  Save,
  Send,
  Copy,
  Play,
  PlayCircle,
  Power,
  SplitSquareVertical,

  // ── UI / Feedback ───────────────────────────────────────────────────────────
  Cloud,
  Info,
  Loader2,
  Minus,
  PackagePlus,
  MoreHorizontal,
  MoreVertical,
  MessageSquare,
  StickyNote,
  Flame,
  Trophy,
  Crown,
  Lightbulb,
  Calculator,
  File,
  Sliders,

  // ── Admin ──────────────────────────────────────────────────────────────
  Building2,
  CreditCard,
  Activity,
  Shield,
  Headphones,

  // ── Proyectos ───────────────────────────────────────────────────────────
  FolderKanban,
  PauseCircle,
  FolderX,
  Flag,

  // ── Partners / PRM ──────────────────────────────────────────────────────
  Handshake,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  BookOpen,
  FileSignature,
  Presentation,

  // Inteligencia Competitiva
  Swords,
  Target,

  // Automatización
  Zap,
  Linkedin,
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
  ChevronUp,
  ChevronsUpDown,
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
  ExternalLink,

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
  Tags,
  Warehouse,
  BarChart2,
  BarChart3,
  ArrowLeftRight,
  LogIn,
  LogOut,
  RefreshCcw,
  RefreshCw,
  CalendarDays,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  FileDown,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Shirt,
  Footprints,
  SunSnow,
  PieChart,
  PackageOpen,
  Briefcase,
  Receipt,
  Landmark,
  Languages,
  Globe,
  Phone,
  PhoneCall,
  MapPin,
  Link2,
  Unlink,
  Bell,
  HardDrive,
  DatabaseZap,
  Filter,

  // Acciones
  Search,
  Plus,
  PlusCircle,
  Pencil,
  Edit,
  Edit2,
  SquarePen,
  Trash2,
  Download,
  Upload,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Store,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  XCircle,
  UserPlus,
  UserX,
  UserCheck,
  Clock,
  Save,
  Send,
  Copy,
  Play,
  PlayCircle,
  Power,
  SplitSquareVertical,

  // UI / Feedback
  Cloud,
  Info,
  Loader2,
  Minus,
  PackagePlus,
  MoreHorizontal,
  MoreVertical,
  MessageSquare,
  StickyNote,
  Flame,
  Trophy,
  Crown,
  Lightbulb,
  Calculator,
  File,
  Sliders,

  // Admin
  Building2,
  CreditCard,
  Activity,
  Shield,
  Headphones,

  // Proyectos
  FolderKanban,
  PauseCircle,
  FolderX,
  Flag,

  // Partners / PRM
  Handshake,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  BookOpen,
  FileSignature,
  Presentation,

  // Inteligencia Competitiva
  Swords,
  Target,

  // Automatización
  Zap,
  Linkedin,
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
