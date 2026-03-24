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
import { MOCK_CATEGORIES } from 'src/_mock/_inventories';
import { QUOTE_STATUS_CONFIG } from 'src/_mock/_quotes';
import { StockBadge } from '../components/StockBadge';
import { StockAdjustmentDrawer } from '../components/StockAdjustmentDrawer';
import { ReserveStockDrawer } from '../components/ReserveStockDrawer';
import { useInventory, type RichProduct } from '../hooks/useInventory';
import type { QuoteMock } from 'src/_mock/_quotes';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<RichProduct>();

// ─── Expanded B2B row ─────────────────────────────────────────────────────────

function B2BExpandedRow({ product }: { product: RichProduct }) {
  const [reserveDrawerOpen, setReserveDrawerOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteMock | null>(null);
  const approvedOrSent = product.relatedQuotes.filter(
    (q) => q.status === 'approved' || q.status === 'sent'
  );

  if (approvedOrSent.length === 0) {
    return (
      <p className="text-body2 text-muted-foreground py-3">
        Sin reservas B2B activas para este producto.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {approvedOrSent.map((q) => {
          const item = q.items.find((i) => i.productId === product.id);
          const qConfig = QUOTE_STATUS_CONFIG[q.status];
          return (
            <div
              key={q.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-caption text-muted-foreground">Nº Cotización</p>
                  <p className="text-subtitle2 text-primary font-medium">{q.id}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Cliente</p>
                  <p className="text-subtitle2 text-foreground">{q.clientName}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Bodega</p>
                  <p className="text-subtitle2 text-foreground">
                    {item?.warehouse === 'main' ? 'B. Principal' : 'Tienda'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-subtitle2 font-bold text-foreground">{item?.quantity ?? 0} uds</p>
                <Badge variant="soft" color={qConfig.color}>
                  {qConfig.label}
                </Badge>
                {q.status === 'sent' && (
                  <button
                    onClick={() => {
                      setSelectedQuote(q);
                      setReserveDrawerOpen(true);
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Aprobar reserva
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ReserveStockDrawer
        open={reserveDrawerOpen}
        quote={selectedQuote}
        onClose={() => setReserveDrawerOpen(false)}
      />
    </>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function StockView() {
  const { products, stats } = useInventory();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [adjustDrawerOpen, setAdjustDrawerOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<RichProduct | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchStatus = filterStatus === 'all' || p.stockStatus === filterStatus;
      const matchWarehouse =
        filterWarehouse === 'all' ||
        (filterWarehouse === 'main' && p.stockMain > 0) ||
        (filterWarehouse === 'store' && p.stockStore > 0);
      return matchSearch && matchCategory && matchStatus && matchWarehouse;
    });
  }, [products, search, filterCategory, filterStatus, filterWarehouse]);

  const statsCards = [
    {
      title: 'Disponible para venta',
      value: stats.totalAvailable.toLocaleString(),
      badge: `${stats.totalPhysical > 0 ? Math.round((stats.totalAvailable / stats.totalPhysical) * 100) : 0}% del físico`,
      badgeClass: 'bg-success/10 text-success',
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Reservado B2B',
      value: stats.totalReserved.toLocaleString(),
      badge: `${stats.totalPhysical > 0 ? Math.round((stats.totalReserved / stats.totalPhysical) * 100) : 0}% del físico`,
      badgeClass: 'bg-info/10 text-info',
      icon: <Icon name="CalendarDays" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Stock físico total',
      value: stats.totalPhysical.toLocaleString(),
      icon: <Icon name="Package" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Cotizaciones aprobadas',
      value: stats.approvedQuotes,
      icon: <Icon name="FileText" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
  ];

  const LEGEND = [
    { dot: 'bg-success', label: 'Disponible', desc: 'Libre para nuevas ventas' },
    { dot: 'bg-info', label: 'Reservado', desc: 'Apartado por cotización B2B aprobada' },
    { dot: 'bg-error', label: 'Sin stock', desc: '0 unidades físicas' },
    { dot: 'bg-warning', label: 'Stock bajo', desc: 'Por debajo del mínimo definido' },
  ];

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        header: '',
        cell: (info) => {
          const isOpen = expandedRows.has(info.row.original.id);
          const hasRelated = info.row.original.relatedQuotes.length > 0;
          if (!hasRelated) return null;
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
      columnHelper.accessor('name', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="text-subtitle2 text-foreground">{info.getValue()}</p>
            <p className="text-caption text-muted-foreground font-mono">{info.row.original.sku}</p>
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Categoría',
        cell: (info) => <Badge variant="soft" color="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('physical', {
        header: () => <div className="text-right w-full">Stock físico</div>,
        cell: (info) => <div className="text-right text-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('stockMain', {
        header: () => <div className="text-right w-full">B. Principal</div>,
        cell: (info) => <div className="text-right text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('stockStore', {
        header: () => <div className="text-right w-full">Tienda</div>,
        cell: (info) => <div className="text-right text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('reserved', {
        header: () => <div className="text-right w-full">Reservado B2B</div>,
        cell: (info) => <div className="text-right text-info font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor('available', {
        header: () => <div className="text-right w-full font-bold text-foreground">Disponible real</div>,
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className={cn('text-right font-bold text-base', val <= 0 ? 'text-error' : 'text-success')}>
              {val}
            </div>
          );
        },
      }),
      columnHelper.accessor('stockStatus', {
        header: 'Estado',
        cell: (info) => <StockBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => {
              setAdjustProduct(info.row.original);
              setAdjustDrawerOpen(true);
            }}
          >
            Ajustar
          </button>
        ),
      }),
    ],
    [expandedRows]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 20,
  });

  const criticalProducts = products.filter((p) => p.available <= 0);

  return (
    <PageContainer>
      <PageHeader
        title="Stock & Disponibilidad"
        subtitle="Visibilidad completa del stock disponible para comprometer"
        action={
          <Button
            color="primary"
            size="sm"
            variant="outline"
            onClick={() => {
              setAdjustProduct(null);
              setAdjustDrawerOpen(true);
            }}
          >
            <Icon name="SlidersHorizontal" size={15} />
            Registrar ajuste
          </Button>
        }
      />

      {/* Banner de alerta global */}
      {criticalProducts.length > 0 && filterStatus !== 'out_of_stock' && filterStatus !== 'reserved' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon name="AlertTriangle" size={16} className="text-error shrink-0" />
            <p className="text-caption text-error font-medium">
              <span className="font-bold">{criticalProducts.length}</span> producto(s) sin stock
              disponible para nuevas ventas
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('out_of_stock')}
            className="text-caption text-error font-semibold hover:underline whitespace-nowrap shrink-0"
          >
            Ver productos críticos
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-card rounded-2xl px-6 py-5 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('p-2.5 rounded-xl shrink-0', card.iconClassName)}>{card.icon}</div>
                <p className="text-3xl font-bold text-foreground leading-none tabular-nums tracking-tight">
                  {card.value}
                </p>
              </div>
              {card.badge && (
                <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap mt-0.5', card.badgeClass)}>
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', item.dot)} />
            <span className="text-caption text-foreground font-medium">{item.label}</span>
            <span className="text-caption text-muted-foreground hidden sm:inline">— {item.desc}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="relative flex-1 min-w-48">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {MOCK_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="out_of_stock">Sin stock</SelectItem>
              <SelectItem value="low_stock">Stock bajo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Bodega" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="main">Principal</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className={cn(
                      'border-border/40 transition-colors',
                      row.original.available <= 0 && 'bg-error/5'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn('px-5', dense ? 'py-2' : 'py-3.5')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && (
                    <TableRow className="bg-muted/10 border-border/40">
                      <TableCell colSpan={row.getVisibleCells().length} className="px-8 py-3">
                        <B2BExpandedRow product={row.original} />
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

      <StockAdjustmentDrawer
        open={adjustDrawerOpen}
        preselectedProduct={adjustProduct}
        onClose={() => {
          setAdjustDrawerOpen(false);
          setAdjustProduct(null);
        }}
      />
    </PageContainer>
  );
}
