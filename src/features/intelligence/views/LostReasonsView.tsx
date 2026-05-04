'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { LOST_REASON_LABELS, LOST_REASON_OPTIONS, MOCK_COMPETITORS } from 'src/_mock/_intelligence';
import { formatMoney } from 'src/lib/currency';
import { formatDate } from 'src/lib/date';
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
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { Badge, Button, Icon, Input, SelectField } from 'src/shared/components/ui';

import { LostDealDrawer } from '../components/LostDealDrawer';
import { LostReasonHeatmap } from '../components/LostReasonHeatmap';
import { useIntelligence } from '../hooks/useIntelligence';
import type { LostDeal, LostReasonCategory } from '../types';
const col = createColumnHelper<LostDeal>();

const COMPETITOR_FILTER_OPTIONS = [
  { value: '', label: 'Todos los competidores' },
  { value: 'none', label: 'Sin competidor' },
  ...MOCK_COMPETITORS.map((c) => ({ value: c.id, label: c.name })),
];

const REASON_FILTER_OPTIONS = [{ value: '', label: 'Todas las razones' }, ...LOST_REASON_OPTIONS];

export function LostReasonsView() {
  const { lostDeals, stats, heatmapData, createLostDeal, updateLostDeal, deleteLostDeal } =
    useIntelligence();

  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [competitorFilter, setCompetitorFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<LostDeal | null>(null);

  const columns = useMemo(
    () => [
      col.accessor('opportunityName', {
        header: 'Deal',
        cell: (info) => (
          <div>
            <p className="text-body2 font-medium text-foreground">{info.getValue()}</p>
            <p className="text-caption text-muted-foreground">{info.row.original.clientName}</p>
          </div>
        ),
      }),
      col.accessor('amount', {
        header: 'Monto',
        cell: (info) => (
          <span className="text-body2 font-semibold text-foreground">
            {formatMoney(info.getValue(), {
              currency: info.row.original.currency,
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      }),
      col.accessor('competitorName', {
        header: 'Competidor',
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="soft" color="error">
              {info.getValue()}
            </Badge>
          ) : (
            <span className="text-caption text-muted-foreground">—</span>
          ),
      }),
      col.accessor('lostReasonCategory', {
        header: 'Razón',
        cell: (info) => (
          <Badge variant="soft" color="warning">
            {LOST_REASON_LABELS[info.getValue() as LostReasonCategory]}
          </Badge>
        ),
      }),
      col.accessor('lostDate', {
        header: 'Fecha',
        cell: (info) => (
          <span className="text-caption text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      col.accessor('salesRepName', {
        header: 'Vendedor',
        cell: (info) => <span className="text-body2">{info.getValue()}</span>,
      }),
      col.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row.original);
                setDrawerOpen(true);
              }}
            >
              <Icon name="Pencil" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                deleteLostDeal(row.original.id);
              }}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        ),
      }),
    ],
    [deleteLostDeal]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lostDeals.filter((d) => {
      if (
        q &&
        !d.opportunityName.toLowerCase().includes(q) &&
        !d.clientName.toLowerCase().includes(q)
      )
        return false;
      if (reasonFilter && d.lostReasonCategory !== reasonFilter) return false;
      if (competitorFilter) {
        if (competitorFilter === 'none' && d.competitorId) return false;
        if (competitorFilter !== 'none' && d.competitorId !== competitorFilter) return false;
      }
      return true;
    });
  }, [lostDeals, search, reasonFilter, competitorFilter]);

  const { table, dense, onChangeDense } = useTable({ data: filtered, columns });

  const handleClose = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Razones de Pérdida"
        subtitle={`${lostDeals.length} deals registrados`}
        action={
          <Button color="primary" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Registrar pérdida
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Deals perdidos"
          value={stats.totalLostDeals}
          icon={<Icon name="TrendingDown" size={18} />}
          iconClassName="bg-error/10 text-error"
          trendUp={false}
        />
        <StatsCard
          title="Monto total perdido"
          value={`$${(stats.totalLostAmount / 1000).toFixed(0)}k`}
          icon={<Icon name="DollarSign" size={18} />}
          iconClassName="bg-warning/10 text-warning"
          trendUp={false}
        />
        <StatsCard
          title="Razón principal"
          value={LOST_REASON_LABELS[stats.topLostReason]}
          icon={<Icon name="AlertCircle" size={18} />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatsCard
          title="Competidor más frecuente"
          value={stats.topCompetitor}
          icon={<Icon name="Swords" size={18} />}
          iconClassName="bg-error/10 text-error"
        />
      </div>

      {/* Heatmap */}
      <LostReasonHeatmap data={heatmapData} />

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            label="Buscar"
            placeholder="Buscar deal o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" size={15} />}
          />
        </div>
        <div className="min-w-[200px]">
          <SelectField
            label="Razón"
            options={REASON_FILTER_OPTIONS}
            value={reasonFilter}
            onChange={(v) => setReasonFilter(v as string)}
            placeholder="Todas las razones"
            clearable
          />
        </div>
        <div className="min-w-[200px]">
          <SelectField
            label="Competidor"
            options={COMPETITOR_FILTER_OPTIONS}
            value={competitorFilter}
            onChange={(v) => setCompetitorFilter(v as string)}
            placeholder="Todos los competidores"
            clearable
          />
        </div>
      </div>

      {/* Tabla */}
      <SectionCard noPadding>
        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Icon name="TrendingDown" size={32} className="opacity-30" />
                      <span className="text-body2">Sin deals que coincidan con los filtros</span>
                    </div>
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
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      <LostDealDrawer
        open={drawerOpen}
        item={editing}
        onClose={handleClose}
        onCreate={createLostDeal}
        onUpdate={updateLostDeal}
      />
    </PageContainer>
  );
}
