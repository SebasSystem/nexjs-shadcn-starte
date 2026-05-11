'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatDate as formatDateLib } from 'src/lib/date';
import { cn } from 'src/lib/utils';
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
import {
  Button,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  Icon,
  Input,
} from 'src/shared/components/ui';

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
        cell: (info) => <RuleStatusBadge enabled={info.row.original.is_active ?? false} />,
      }),
      columnHelper.accessor('last_run_at', {
        header: 'Última ej.',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('execution_count', {
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
              <EditButton onClick={() => router.push(paths.automation.ruleEdit(rule.uid))} />
              <button
                title={rule.is_active ? 'Pausar regla' : 'Activar regla'}
                onClick={() => toggleRule(rule.uid)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  rule.is_active
                    ? 'text-success hover:bg-success/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon name="Power" size={14} />
              </button>
              <DeleteButton onClick={() => setDeleteTarget(rule)} />
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
