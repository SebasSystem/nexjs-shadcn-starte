import { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

import { Icon } from './icon';

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
        <h2 className="text-h6 text-foreground mb-1">{title}</h2>
        {subtitle && <p className="text-body2 text-muted-foreground">{subtitle}</p>}
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
  value: ReactNode;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  iconClassName?: string;
  className?: string;
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-muted/50 animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-muted/40 animate-pulse" />
      </div>
      <div className="h-9 w-28 rounded-lg bg-muted/60 animate-pulse mb-2" />
      <div className="h-4 w-36 rounded bg-muted/40 animate-pulse" />
    </div>
  );
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
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full',
              trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            )}
          >
            {trendUp ? (
              <Icon name="TrendingUp" className="h-3 w-3 shrink-0" />
            ) : (
              <Icon name="TrendingDown" className="h-3 w-3 shrink-0" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-h3 text-foreground mb-1">{value}</div>
      <div className="text-body2 font-medium text-muted-foreground">{title}</div>
    </div>
  );
}
