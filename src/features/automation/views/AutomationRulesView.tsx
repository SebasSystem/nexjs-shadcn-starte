'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Button } from 'src/shared/components/ui/button';
import { ConfirmDialog } from 'src/shared/components/ui/confirm-dialog';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';

import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { useAutomationRules } from '../hooks/useAutomationRules';
import type { AutomationRule } from '../types';
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
  const { rules, stats, toggleRule, deleteRule, isLoading, pagination } = useAutomationRules();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AutomationRule | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rules;
    return rules.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
    );
  }, [rules, search]);

  const columnHelper = createColumnHelper<AutomationRule>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: (info) => {
          const rule = info.row.original;
          return (
            <div>
              <p className="font-semibold text-foreground">{rule.name}</p>
              {rule.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                  {rule.description}
                </p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('trigger_event', {
        header: 'Trigger',
        cell: (info) => {
          const rule = info.row.original;
          return (
            <span className="text-sm text-foreground">
              {TRIGGER_EVENT_LABELS[rule.trigger_event]}
            </span>
          );
        },
      }),
      columnHelper.accessor('trigger_source', {
        header: 'Fuente',
        cell: (info) => {
          const rule = info.row.original;
          return (
            <span className="text-sm text-muted-foreground">
              {TRIGGER_SOURCE_LABELS[rule.trigger_source]}
            </span>
          );
        },
      }),
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue().length}</span>
        ),
      }),
      columnHelper.display({
        id: 'estado',
        header: 'Estado',
        cell: (info) => <RuleStatusBadge enabled={info.row.original.enabled} />,
      }),
      columnHelper.accessor('last_run_at', {
        header: 'Última ej.',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('run_count', {
        header: 'Ej.',
        cell: (info) => (
          <span className="text-sm text-right font-mono text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: '',
        cell: (info) => {
          const rule = info.row.original;
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
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
                onClick={() => setDeleteTarget(rule)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          );
        },
      }),
    ],
    [router, toggleRule, columnHelper]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns,
    defaultRowsPerPage: 10,
    total: pagination.total,
    pageIndex: pagination.page - 1,
    pageSize: pagination.rowsPerPage,
    onPageChange: (pi: number) => pagination.onChangePage(pi + 1),
    onPageSizeChange: pagination.onChangeRowsPerPage,
  });

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
            <Table>
              <TableHeadCustom table={table} />
              <TableBody dense={dense}>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Sin resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-border/40">
            <TablePaginationCustom
              table={table}
              dense={dense}
              onChangeDense={onChangeDense}
              total={pagination.total}
            />
          </div>
        </SectionCard>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteRule(deleteTarget.uid);
          setDeleteTarget(null);
        }}
        title="¿Eliminar regla?"
        description={
          <>
            Vas a eliminar la regla <strong>{deleteTarget?.name}</strong>. Esta acción no se puede
            deshacer.
          </>
        }
        confirmLabel="Eliminar"
        variant="error"
      />
    </PageContainer>
  );
}
