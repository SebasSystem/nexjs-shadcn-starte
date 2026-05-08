'use client';

import Link from 'next/link';
import type { RecentActivity } from 'src/features/dashboard/types/dashboard.types';
import { formatDate } from 'src/lib/date';
import { paths } from 'src/routes/paths';
import { SectionCard } from 'src/shared/components/layouts/page';
import { Icon } from 'src/shared/components/ui';

const ACTIVITY_ICON = {
  task: 'CheckSquare',
  reminder: 'Bell',
  meeting: 'Users',
} as const;

interface Props {
  activities: RecentActivity[];
}

export function RecentActivitiesList({ activities }: Props) {
  if (activities.length === 0) return null;

  return (
    <SectionCard noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon name="Activity" size={15} className="text-primary" />
          </div>
          <div>
            <h3 className="text-subtitle1 font-semibold text-foreground">Actividades Recientes</h3>
            <p className="text-caption text-muted-foreground">Últimas actividades del equipo</p>
          </div>
        </div>
        <Link
          href={paths.schedule.root}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Ver todas <Icon name="ChevronRight" size={14} />
        </Link>
      </div>

      <div className="divide-y divide-border/40">
        {activities.map((activity) => (
          <div
            key={activity.uid}
            className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Icon
                  name={ACTIVITY_ICON[activity.type]}
                  size={14}
                  className="text-muted-foreground"
                />
              </div>
              <div className="min-w-0">
                <p className="text-subtitle2 text-foreground truncate">{activity.title}</p>
                <p className="text-caption text-muted-foreground truncate">
                  {activity.activityable?.name ?? '—'} ·{' '}
                  {activity.assigned_user?.name ?? activity.owner?.name ?? '—'}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
              {formatDate(activity.scheduled_at, { month: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
