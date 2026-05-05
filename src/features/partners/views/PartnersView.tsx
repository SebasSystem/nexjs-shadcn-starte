'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
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

import { PartnerDrawer } from '../components/PartnerDrawer';
import { usePartners } from '../hooks/usePartners';
import type { Partner } from '../types';
import { PARTNER_STATUS_CONFIG, PARTNER_TYPE_CONFIG } from '../types';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Partner>();

// ─── Main View ────────────────────────────────────────────────────────────────

export function PartnersView() {
  const { partners, partnerStats, opportunities, createPartner, updatePartner } = usePartners();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.region.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || p.type === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [partners, search, filterType, filterStatus]);

  const openOpps = useMemo(
    () => opportunities.filter((o) => o.status === 'pending' || o.status === 'approved').length,
    [opportunities]
  );

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Partner',
        cell: (info) => {
          const typeConfig = PARTNER_TYPE_CONFIG[info.row.original.type];
          return (
            <div>
              <p className="text-subtitle2 font-medium text-foreground">{info.getValue()}</p>
              <Badge variant="soft" color={typeConfig.color} className="mt-0.5 text-[10px]">
                {typeConfig.label}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor('region', {
        header: 'Región',
        cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('contact_name', {
        header: 'Contacto',
        cell: (info) => (
          <div>
            <p className="text-subtitle2">{info.getValue()}</p>
            <p className="text-caption text-muted-foreground">{info.row.original.contact_email}</p>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const cfg = PARTNER_STATUS_CONFIG[info.getValue()];
          return (
            <Badge variant="soft" color={cfg.color}>
              {cfg.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('registered_opportunities', {
        header: () => <div className="text-right w-full">Oportunidades</div>,
        cell: (info) => <div className="text-right text-body2 font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor('converted_deals', {
        header: () => <div className="text-right w-full">Deals ganados</div>,
        cell: (info) => (
          <div className="text-right text-body2 text-success font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={() => {
              setSelectedPartner(info.row.original);
              setDrawerMode('edit');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Pencil" size={14} />
          </button>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 15,
  });

  const statsCards = [
    {
      title: 'Partners activos',
      value: partnerStats.active,
      trend: 'en operación',
      trendUp: true,
      icon: <Icon name="Handshake" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Prospectos',
      value: partnerStats.prospects,
      trend: 'en evaluación',
      trendUp: true,
      icon: <Icon name="UserPlus" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
    {
      title: 'Oportunidades abiertas',
      value: openOpps,
      trend: 'pendientes + aprobadas',
      trendUp: true,
      icon: <Icon name="ClipboardList" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Deals convertidos',
      value: partnerStats.convertedDeals,
      trend: 'histórico total',
      trendUp: true,
      icon: <Icon name="TrendingUp" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Partners & Canales"
        subtitle="Gestión de distribuidores, resellers y aliados comerciales"
        action={
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              setSelectedPartner(null);
              setDrawerMode('create');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Plus" size={16} />
            Nuevo partner
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            trend={card.trend}
            trendUp={card.trendUp}
          />
        ))}
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="flex-1 min-w-48">
            <Input
              label="Buscar"
              placeholder="Buscar por nombre o región..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="Search" size={15} />}
            />
          </div>

          <SelectField
            label="Tipo"
            options={[
              { value: 'all', label: 'Todos los tipos' },
              ...Object.entries(PARTNER_TYPE_CONFIG).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              })),
            ]}
            value={filterType}
            onChange={(v) => setFilterType(v as string)}
          />

          <SelectField
            label="Estado"
            options={[
              { value: 'all', label: 'Todos' },
              ...Object.entries(PARTNER_STATUS_CONFIG).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              })),
            ]}
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as string)}
          />
        </div>

        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      <PartnerDrawer
        open={drawerOpen}
        mode={drawerMode}
        partner={selectedPartner}
        onClose={() => setDrawerOpen(false)}
        onCreate={createPartner}
        onUpdate={updatePartner}
      />
    </PageContainer>
  );
}
