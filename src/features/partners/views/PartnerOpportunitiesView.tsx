'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from 'src/shared/components/ui';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from 'src/shared/components/table';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { toast } from 'sonner';
import { PARTNER_OPP_STATUS_CONFIG } from 'src/_mock/_partners';
import { PartnerOpportunityDrawer } from '../components/PartnerOpportunityDrawer';
import { usePartners } from '../hooks/usePartners';
import type { PartnerOpportunity } from '../types';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PartnerOpportunity>();

// ─── Main View ────────────────────────────────────────────────────────────────

export function PartnerOpportunitiesView() {
  const {
    opportunities,
    partners,
    opportunityStats,
    createOpportunity,
    updateOpportunity,
    approveOpportunity,
    rejectOpportunity,
    convertOpportunity,
  } = usePartners();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPartner, setFilterPartner] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedOpp, setSelectedOpp] = useState<PartnerOpportunity | null>(null);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const matchSearch =
        !search ||
        o.partnerName.toLowerCase().includes(search.toLowerCase()) ||
        o.clientName.toLowerCase().includes(search.toLowerCase()) ||
        o.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchPartner = filterPartner === 'all' || o.partnerId === filterPartner;
      return matchSearch && matchStatus && matchPartner;
    });
  }, [opportunities, search, filterStatus, filterPartner]);

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('clientName', {
        header: 'Oportunidad',
        cell: (info) => (
          <div>
            <p className="text-subtitle2 font-medium text-foreground">{info.getValue()}</p>
            <p className="text-caption text-muted-foreground line-clamp-1">
              {info.row.original.product}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('partnerName', {
        header: 'Partner',
        cell: (info) => <span className="text-body2">{info.getValue()}</span>,
      }),
      columnHelper.accessor('estimatedValue', {
        header: () => <div className="text-right w-full">Valor est.</div>,
        cell: (info) => (
          <div className="text-right">
            <span className="text-body2 font-medium">
              {info.row.original.currency}{' '}
              {info.getValue().toLocaleString('es', { minimumFractionDigits: 0 })}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('registeredDate', {
        header: 'Registrada',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString('es', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('assignedToInternal', {
        header: 'Asignado a',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">{info.getValue() ?? '—'}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const cfg = PARTNER_OPP_STATUS_CONFIG[info.getValue()];
          return (
            <Badge variant="soft" color={cfg.color}>
              {cfg.label}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const { status, partnerName } = info.row.original;
          return (
            <div className="flex items-center gap-2">
              {status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    color="success"
                    variant="soft"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      approveOpportunity(info.row.original.id);
                      toast.success(
                        `Oportunidad aprobada. ${partnerName} tiene exclusividad sobre este cliente.`
                      );
                    }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    color="error"
                    variant="soft"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      rejectOpportunity(info.row.original.id);
                      toast.success('Oportunidad rechazada.');
                    }}
                  >
                    Rechazar
                  </Button>
                </>
              )}
              {status === 'approved' && (
                <Button
                  size="sm"
                  color="info"
                  variant="soft"
                  className="h-6 text-[11px] px-2"
                  onClick={() => {
                    convertOpportunity(info.row.original.id);
                    toast.success('Oportunidad marcada como convertida al pipeline.');
                  }}
                >
                  Convertir
                </Button>
              )}
              <button
                className="text-muted-foreground hover:text-primary transition-colors ml-1"
                onClick={() => {
                  setSelectedOpp(info.row.original);
                  setDrawerMode('edit');
                  setDrawerOpen(true);
                }}
              >
                <Icon name="Pencil" size={14} />
              </button>
            </div>
          );
        },
      }),
    ],
    [approveOpportunity, rejectOpportunity, convertOpportunity]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 15,
  });

  const statsCards = [
    {
      title: 'Pendientes de revisión',
      value: opportunityStats.pending,
      trend: 'esperan aprobación',
      trendUp: false,
      icon: <Icon name="Clock" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
    {
      title: 'Aprobadas',
      value: opportunityStats.approved,
      trend: 'con exclusividad',
      trendUp: true,
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Rechazadas',
      value: opportunityStats.rejected,
      trend: 'no habilitadas',
      trendUp: false,
      icon: <Icon name="XCircle" size={18} />,
      iconClassName: 'bg-error/10 text-error',
    },
    {
      title: 'Convertidas al pipeline',
      value: opportunityStats.converted,
      trend: 'en seguimiento',
      trendUp: true,
      icon: <Icon name="ArrowRight" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Registro de Oportunidades"
        subtitle="Deal registration — evitá conflictos de canal entre partners"
        action={
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              setSelectedOpp(null);
              setDrawerMode('create');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Plus" size={16} />
            Registrar oportunidad
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

      {/* Banner pendientes */}
      {opportunityStats.pending > 0 && filterStatus !== 'pending' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon name="AlertCircle" size={16} className="text-warning shrink-0" />
            <p className="text-caption text-warning font-medium">
              <span className="font-bold">{opportunityStats.pending}</span> oportunidad(es)
              pendientes de revisión
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('pending')}
            className="text-caption text-warning font-semibold hover:underline whitespace-nowrap shrink-0"
          >
            Ver pendientes
          </button>
        </div>
      )}

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por partner, cliente o producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(PARTNER_OPP_STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPartner} onValueChange={setFilterPartner}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los partners</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <PartnerOpportunityDrawer
        open={drawerOpen}
        mode={drawerMode}
        opportunity={selectedOpp}
        partners={partners}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedOpp(null);
        }}
        onCreate={createOpportunity}
        onUpdate={updateOpportunity}
      />
    </PageContainer>
  );
}
