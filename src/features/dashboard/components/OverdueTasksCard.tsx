'use client';

import Link from 'next/link';
import type { DashboardSummary, OverdueTask } from 'src/features/dashboard/types/dashboard.types';
import { formatTime } from 'src/lib/date';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { SectionCard } from 'src/shared/components/layouts/page';
import { Badge, Icon } from 'src/shared/components/ui';

const PRIORITY_MAP = {
  high: { label: 'Alta', color: 'bg-red-500/10 text-red-600' },
  medium: { label: 'Media', color: 'bg-amber-500/10 text-amber-600' },
  low: { label: 'Baja', color: 'bg-blue-500/10 text-blue-600' },
} satisfies Record<OverdueTask['priority'], { label: string; color: string }>;

interface Props {
  summary: DashboardSummary;
  overdue_tasks: OverdueTask[];
}

export function OverdueTasksCard({ summary, overdue_tasks }: Props) {
  const highCount = overdue_tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = overdue_tasks.filter((t) => t.priority === 'medium').length;

  return (
    <SectionCard noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <Icon name="Clock" size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-subtitle1 font-semibold text-foreground">Tareas Vencidas Hoy</h3>
            <p className="text-caption text-muted-foreground">Requieren atención inmediata</p>
          </div>
        </div>
        <Link
          href={paths.schedule.overdue}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Ver todas <Icon name="ChevronRight" size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 pb-4">
        <div className="rounded-xl bg-red-500/10 px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-red-600 leading-none">
            {summary.overdue_tasks_today}
          </p>
          <p className="text-[10px] font-medium text-red-600/80 mt-1">Total vencidas</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-amber-600 leading-none">{highCount}</p>
          <p className="text-[10px] font-medium text-amber-600/80 mt-1">Alta prioridad</p>
        </div>
        <div className="rounded-xl bg-blue-500/10 px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-blue-600 leading-none">{mediumCount}</p>
          <p className="text-[10px] font-medium text-blue-600/80 mt-1">Media prioridad</p>
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {overdue_tasks.map((task) => {
          const { label, color } = PRIORITY_MAP[task.priority];
          return (
            <div
              key={task.uid}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                  <Icon name="AlertCircle" size={14} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-subtitle2 text-foreground truncate">{task.title}</p>
                  <p className="text-caption text-muted-foreground truncate">
                    {task.account_name} · {task.assigned_to_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge
                  variant="soft"
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border-none',
                    color
                  )}
                >
                  {label}
                </Badge>
                <span className="text-[11px] text-muted-foreground w-20 text-right">
                  {formatTime(task.due_date)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
