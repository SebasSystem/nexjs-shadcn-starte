'use client';

import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { TRIGGER_SOURCE_LABELS, TRIGGER_EVENT_LABELS, ACTION_TYPE_LABELS } from '../types';
import { RuleStatusBadge } from './RuleStatusBadge';
import type { AutomationRule } from '../types';

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
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
            {TRIGGER_SOURCE_LABELS[rule.triggerSource]} · {TRIGGER_EVENT_LABELS[rule.triggerEvent]}
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
          <span className="font-medium text-foreground">{rule.runCount}</span>
          {rule.lastRunAt && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Último: {formatDate(rule.lastRunAt)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border/30">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={() => router.push(paths.automation.ruleEdit(rule.id))}
        >
          <Pencil size={12} />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onClick={() => onToggle(rule.id)}
        >
          <Power size={12} />
          {rule.enabled ? 'Pausar' : 'Activar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 ml-auto"
          onClick={() => onDelete(rule.id)}
        >
          <Trash2 size={12} />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
