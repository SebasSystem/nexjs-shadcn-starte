'use client';

import { Fragment, useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import {
  MOVEMENT_TYPE_CONFIG,
  ADJUSTMENT_REASON_LABELS,
  type WarehouseMovement,
} from 'src/_mock/_inventories';
import { TransferDrawer } from '../components/TransferDrawer';
import { GoodsReceiptDrawer } from '../components/GoodsReceiptDrawer';
import { useInventory } from '../hooks/useInventory';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<WarehouseMovement>();

// ─── Expanded row for receipt / adjustment ────────────────────────────────────

function MovementExpandedRow({ movement }: { movement: WarehouseMovement }) {
  if (movement.type === 'receipt' && movement.receiptItems) {
    return (
      <div className="space-y-1.5">
        <p className="text-caption text-muted-foreground font-medium uppercase tracking-wide mb-2">
          Productos recibidos
        </p>
        {movement.receiptItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30"
          >
            <div>
              <p className="text-subtitle2 text-foreground">{item.productName}</p>
              <p className="text-caption text-muted-foreground font-mono">{item.productSku}</p>
            </div>
            <p className="text-subtitle2 font-bold text-success">{item.quantity} uds</p>
          </div>
        ))}
        {movement.receiptOrderRef && (
          <p className="text-caption text-muted-foreground mt-1">
            Orden de compra:{' '}
            <span className="font-medium text-foreground">{movement.receiptOrderRef}</span>
          </p>
        )}
      </div>
    );
  }

  if (movement.type === 'adjustment_add' || movement.type === 'adjustment_sub') {
    return (
      <div className="flex flex-col gap-1 text-caption text-muted-foreground">
        <p>
          Bodega:{' '}
          <span className="text-foreground font-medium">
            {movement.adjustmentWarehouse === 'main' ? 'Bodega Principal' : 'Tienda'}
          </span>
        </p>
        <p>
          Motivo:{' '}
          <span className="text-foreground font-medium">
            {movement.adjustmentReason ? ADJUSTMENT_REASON_LABELS[movement.adjustmentReason] : '—'}
          </span>
          {movement.adjustmentReasonOther && ` — ${movement.adjustmentReasonOther}`}
        </p>
        {movement.comment && (
          <p>
            Notas: <span className="text-foreground">{movement.comment}</span>
          </p>
        )}
      </div>
    );
  }

  if (movement.type === 'reservation') {
    return (
      <div className="text-caption text-muted-foreground">
        Reserva vinculada a cotización:{' '}
        <span className="text-primary font-medium">{movement.quoteId}</span> — {movement.clientName}
      </div>
    );
  }

  return null;
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function MovementsView() {
  const { movements, movementStats } = useInventory();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFrom, setFilterFrom] = useState('all');
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canExpand = (m: WarehouseMovement) =>
    m.type === 'receipt' ||
    m.type === 'adjustment_add' ||
    m.type === 'adjustment_sub' ||
    m.type === 'reservation';

  const statsCards = [
    {
      title: 'Movimientos este mes',
      value: movementStats.totalThisMonth,
      icon: <Icon name="ArrowLeftRight" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Entradas de mercancía',
      value: movementStats.receipts,
      icon: <Icon name="PackagePlus" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Traslados entre bodegas',
      value: movementStats.transfers,
      icon: <Icon name="ArrowLeftRight" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Ajustes manuales',
      value: movementStats.adjustments,
      icon: <Icon name="SlidersHorizontal" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
  ];

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const searchStr =
        (m.productName ?? '') + (m.productSku ?? '') + (m.quoteId ?? '') + (m.clientName ?? '');
      const matchSearch = !search || searchStr.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || m.type === filterType;
      const matchFrom = filterFrom === 'all' || m.from === filterFrom;
      return matchSearch && matchType && matchFrom;
    });
  }, [movements, search, filterType, filterFrom]);

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        header: '',
        cell: (info) => {
          if (!canExpand(info.row.original)) return null;
          const isOpen = expandedRows.has(info.row.original.id);
          return (
            <button
              onClick={() => toggleRow(info.row.original.id)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={15} />
            </button>
          );
        },
      }),
      columnHelper.accessor('date', {
        header: 'Fecha y hora',
        cell: (info) => (
          <span className="text-caption text-muted-foreground whitespace-nowrap">
            {new Date(info.getValue()).toLocaleString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: (info) => {
          const config = MOVEMENT_TYPE_CONFIG[info.getValue()];
          return (
            <Badge variant="soft" color={config.color}>
              {config.label}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'description',
        header: 'Descripción',
        cell: (info) => {
          const m = info.row.original;
          if (m.type === 'transfer') {
            return (
              <div>
                <p className="text-subtitle2 text-foreground">{m.productName}</p>
                <p className="text-caption text-muted-foreground font-mono">{m.productSku}</p>
              </div>
            );
          }
          if (m.type === 'receipt') {
            const count = m.receiptItems?.length ?? 0;
            const total = m.receiptItems?.reduce((s, i) => s + i.quantity, 0) ?? 0;
            return (
              <p className="text-subtitle2 text-foreground">
                {count} producto(s) · {total} uds totales
              </p>
            );
          }
          if (m.type === 'adjustment_add' || m.type === 'adjustment_sub') {
            return (
              <div>
                <p className="text-subtitle2 text-foreground">{m.productName}</p>
                <p className="text-caption text-muted-foreground">
                  {m.adjustmentReason ? ADJUSTMENT_REASON_LABELS[m.adjustmentReason] : ''}
                </p>
              </div>
            );
          }
          if (m.type === 'reservation') {
            return (
              <div>
                <p className="text-subtitle2 text-primary">{m.quoteId}</p>
                <p className="text-caption text-muted-foreground">{m.clientName}</p>
              </div>
            );
          }
          return null;
        },
      }),
      columnHelper.display({
        id: 'route',
        header: 'Ruta',
        cell: (info) => {
          const m = info.row.original;
          if (m.type === 'transfer') {
            return (
              <div className="flex items-center gap-1.5">
                <Badge variant="soft" color="secondary">
                  {m.from === 'main' ? 'B. Principal' : 'Tienda'}
                </Badge>
                <Icon name="ArrowRight" size={12} className="text-muted-foreground" />
                <Badge variant="soft" color="info">
                  {m.to === 'main' ? 'B. Principal' : 'Tienda'}
                </Badge>
              </div>
            );
          }
          if (m.type === 'receipt') {
            return (
              <div className="flex items-center gap-1.5">
                <Badge variant="soft" color="secondary">
                  Externo
                </Badge>
                <Icon name="ArrowRight" size={12} className="text-muted-foreground" />
                <Badge variant="soft" color="success">
                  {m.to === 'main' ? 'B. Principal' : 'Tienda'}
                </Badge>
              </div>
            );
          }
          if (m.type === 'adjustment_add' || m.type === 'adjustment_sub') {
            return (
              <Badge variant="soft" color={m.type === 'adjustment_add' ? 'success' : 'warning'}>
                {m.adjustmentWarehouse === 'main' ? 'B. Principal' : 'Tienda'}
              </Badge>
            );
          }
          return null;
        },
      }),
      columnHelper.accessor('quantity', {
        header: () => <div className="text-right w-full">Cantidad</div>,
        cell: (info) => {
          const m = info.row.original;
          const qty = info.getValue() ?? 0;
          const isNegative = m.type === 'adjustment_sub';
          return (
            <div
              className={cn(
                'text-right font-semibold',
                isNegative ? 'text-warning' : 'text-foreground'
              )}
            >
              {isNegative ? '-' : m.type === 'adjustment_add' ? '+' : ''}
              {qty}
            </div>
          );
        },
      }),
      columnHelper.accessor('registeredBy', {
        header: 'Registrado por',
        cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [expandedRows]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 20,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Movimientos"
        subtitle="Historial completo de traslados, entradas y ajustes"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <Icon name="ArrowLeftRight" size={15} />
              Traslado
            </Button>
            <Button color="primary" size="sm" onClick={() => setReceiptOpen(true)}>
              <Icon name="PackagePlus" size={15} />
              Entrada
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-card rounded-2xl px-6 py-5 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={cn('p-2.5 rounded-xl shrink-0', card.iconClassName)}>{card.icon}</div>
              <p className="text-3xl font-bold text-foreground leading-none tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por producto, cotización..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="transfer">Traslados</SelectItem>
              <SelectItem value="receipt">Entradas de mercancía</SelectItem>
              <SelectItem value="adjustment_add">Ajuste positivo</SelectItem>
              <SelectItem value="adjustment_sub">Ajuste negativo</SelectItem>
              <SelectItem value="reservation">Reservas B2B</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFrom} onValueChange={setFilterFrom}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Bodega origen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier origen</SelectItem>
              <SelectItem value="main">B. Principal</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
              <SelectItem value="external">Externo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className="border-border/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn('px-5', dense ? 'py-2' : 'py-3.5')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && canExpand(row.original) && (
                    <TableRow className="bg-muted/10 border-border/40">
                      <TableCell colSpan={row.getVisibleCells().length} className="px-8 py-3">
                        <MovementExpandedRow movement={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      <TransferDrawer open={transferOpen} onClose={() => setTransferOpen(false)} />
      <GoodsReceiptDrawer open={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </PageContainer>
  );
}
