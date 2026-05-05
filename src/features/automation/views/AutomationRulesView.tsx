'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatDate as formatDateLib } from 'src/lib/date';
import { paths } from 'src/routes/paths';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';

import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { TRIGGER_EVENT_LABELS, TRIGGER_SOURCE_LABELS } from '../types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return formatDateLib(dateStr, { month: 'short' });
  } catch {
    return '—';
  }
}

export function AutomationRulesView() {
  const router = useRouter();
  const { rules, stats, toggleRule, deleteRule, isLoading } = useAutomationRules();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rules;
    return rules.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
    );
  }, [rules, search]);

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reglas de Automatización"
        subtitle="Configurá disparadores y acciones automáticas para tu pipeline comercial"
        action={
          <Button color="primary" onClick={() => router.push(paths.automation.ruleNew)}>
            <Icon name="Plus" size={16} />
            Nueva regla
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Reglas activas"
          value={stats.activeCount}
          icon={<Icon name="Zap" size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-500"
          trendUp
        />
        <StatsCard
          title="Reglas inactivas"
          value={stats.inactiveCount}
          icon={<Icon name="Activity" size={20} />}
          iconClassName="bg-muted text-muted-foreground"
          trendUp={false}
        />
        <StatsCard
          title="Total ejecuciones"
          value={stats.totalRuns}
          icon={<Icon name="PlayCircle" size={20} />}
          iconClassName="bg-primary/10 text-primary"
          trendUp
        />
        <StatsCard
          title="Última ejecución"
          value={formatDate(stats.lastRun)}
          icon={<Icon name="Clock" size={20} />}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
      </div>

      {isLoading && filtered.length === 0 && (
        <SectionCard>
          <p className="text-sm text-muted-foreground text-center py-8">Cargando reglas...</p>
        </SectionCard>
      )}

      {!isLoading && (
        <SectionCard noPadding>
          <div className="p-5 border-b border-border/40">
            <Input
              label="Buscar"
              placeholder="Buscar reglas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="Search" size={15} />}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Última ej.
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Ej.
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      Sin resultados
                    </td>
                  </tr>
                )}
                {filtered.map((rule) => (
                  <tr
                    key={rule.uid}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-foreground">{rule.name}</p>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {rule.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {TRIGGER_EVENT_LABELS[rule.trigger_event]}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {TRIGGER_SOURCE_LABELS[rule.trigger_source]}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {rule.actions.length}
                    </td>
                    <td className="px-4 py-3">
                      <RuleStatusBadge enabled={rule.enabled} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(rule.last_run_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                      {rule.run_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Editar"
                          onClick={() => router.push(paths.automation.ruleEdit(rule.uid))}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button
                          title={rule.enabled ? 'Pausar' : 'Activar'}
                          onClick={() => toggleRule(rule.uid)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Icon name="Power" size={14} />
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => deleteRule(rule.uid)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </PageContainer>
  );
}
