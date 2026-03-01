import { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// PageContainer — contenedor estándar de todas las páginas
//
// Uso:
//   <PageContainer>
//     <PageHeader title="..." subtitle="..." />
//     ...contenido...
//   </PageContainer>
// ─────────────────────────────────────────────────────────────────────────────
interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** true = sin padding máx-width, útil para páginas full-width */
  fluid?: boolean;
}

export function PageContainer({ children, className, fluid = false }: PageContainerProps) {
  return (
    <div className={cn('p-6 md:p-8 space-y-6', !fluid && 'max-w-[1400px] mx-auto', className)}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — título + subtítulo + acciones de página
//
// Uso:
//   <PageHeader
//     title="Gestión de Productos"
//     subtitle="Administra el catálogo completo"
//     action={<Button color="primary">Nuevo producto</Button>}
//   />
// ─────────────────────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionCard — tarjeta de sección reutilizable
//
// Alternativa ligera al <Card> de Shadcn, sin el gap-6 interno.
// Ideal para tablas, listas, o cualquier bloque visual.
//
// Uso:
//   <SectionCard>
//     <SectionCardHeader title="Usuarios" subtitle="3 activos" action={...} />
//     <table>...</table>
//   </SectionCard>
// ─────────────────────────────────────────────────────────────────────────────
interface SectionCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({ children, className, noPadding = false }: SectionCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl shadow-card overflow-hidden',
        !noPadding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionCardHeader — cabecera de SectionCard con título + subtítulo + acción
// ─────────────────────────────────────────────────────────────────────────────
interface SectionCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionCardHeader({ title, subtitle, action, className }: SectionCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-5', className)}>
      <div>
        <h2 className="text-sm font-semibold text-foreground leading-none">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatsCard — tarjeta de KPI / métrica
//
// Uso:
//   <StatsCard
//     title="Usuarios activos"
//     value="1,284"
//     trend="+8% vs mes anterior"
//     trendUp
//     icon={<Icon name="Users" />}
//     iconClassName="bg-primary/10 text-primary"
//   />
// ─────────────────────────────────────────────────────────────────────────────
interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  iconClassName?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  trendUp = true,
  icon,
  iconClassName,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && <div className={cn('p-2.5 rounded-xl', iconClassName)}>{icon}</div>}
        {trend && (
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            )}
          >
            {trendUp ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{title}</p>
      {trend && (
        <p className="text-[11px] text-muted-foreground/70 mt-2 pt-2 border-t border-border/40">
          {trend}
        </p>
      )}
    </div>
  );
}
