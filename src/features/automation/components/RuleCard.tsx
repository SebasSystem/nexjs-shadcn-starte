'use client';

import { useRouter } from 'next/navigation';
import { formatDate as formatDateLib } from 'src/lib/date';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import type { AutomationRule } from '../types';
import { ACTION_TYPE_LABELS, TRIGGER_EVENT_LABELS, TRIGGER_SOURCE_LABELS } from '../types';
import { RuleStatusBadge } from './RuleStatusBadge';

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: (uid: string) => void;
  onDelete: (uid: string) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return formatDateLib(dateStr, { month: 'short' });
  } catch {
    return dateStr;
  }
}

export function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border/60 p-4 transition-all duration-200',
        'hover:shadow-lg hover:shadow-black/5 hover:border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">{rule.name}</p>
          {rule.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rule.description}</p>
          )}
        </div>
        <RuleStatusBadge enabled={rule.enabled} className="shrink-0" />
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Trigger:</span>
          <span className="font-medium text-foreground">
            {TRIGGER_SOURCE_LABELS[rule.trigger_source]} ·{' '}
            {TRIGGER_EVENT_LABELS[rule.trigger_event]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Acciones:</span>
          <span className="font-medium text-foreground">
            {rule.actions.map((a) => ACTION_TYPE_LABELS[a.type]).join(', ') || '—'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Ejecuciones:</span>
          <span className="font-medium text-foreground">{rule.run_count}</span>
          {rule.last_run_at && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Último: {formatDate(rule.last_run_at)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border/30">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={() => router.push(paths.automation.ruleEdit(rule.uid))}
        >
          <Icon name="Pencil" size={12} />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={() => onToggle(rule.uid)}
        >
          <Icon name="Power" size={12} />
          {rule.enabled ? 'Pausar' : 'Activar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 ml-auto"
          onClick={() => onDelete(rule.uid)}
        >
          <Icon name="Trash2" size={12} />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
