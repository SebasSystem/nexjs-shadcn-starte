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
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_B2B_RESERVATIONS,
  getProductStockStatus,
  getProductAvailable,
  type Product,
} from 'src/_mock/_inventories';
import { StockBadge } from '../components/StockBadge';

// ─── Stats ────────────────────────────────────────────────────────────────────

const totalAvailable = MOCK_PRODUCTS.reduce((sum, p) => sum + getProductAvailable(p), 0);
const totalReserved = MOCK_PRODUCTS.reduce((sum, p) => sum + p.reserved, 0);
const totalPhysical = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stockMain + p.stockStore, 0);
const activeQuotes = new Set(MOCK_B2B_RESERVATIONS.map((r) => r.quoteNumber)).size;

const pctAvailableOfPhysical =
  totalPhysical > 0 ? Math.round((totalAvailable / totalPhysical) * 100) : 0;
const pctReservedOfPhysical =
  totalPhysical > 0 ? Math.round((totalReserved / totalPhysical) * 100) : 0;

const statsCards = [
  {
    title: 'Disponible para venta',
    value: totalAvailable.toLocaleString(),
    badge: `${pctAvailableOfPhysical}% del físico`,
    badgeClass: 'bg-success/10 text-success',
    icon: <Icon name="CheckCircle" size={18} />,
    iconClassName: 'bg-success/10 text-success',
  },
  {
    title: 'Reservado B2B',
    value: totalReserved.toLocaleString(),
    badge: `${pctReservedOfPhysical}% del físico`,
    badgeClass: 'bg-info/10 text-info',
    icon: <Icon name="CalendarDays" size={18} />,
    iconClassName: 'bg-info/10 text-info',
  },
  {
    title: 'Stock físico total',
    value: totalPhysical.toLocaleString(),
    icon: <Icon name="Package" size={18} />,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    title: 'Cotizaciones con reserva',
    value: activeQuotes,
    icon: <Icon name="FileText" size={18} />,
    iconClassName: 'bg-warning/10 text-warning',
  },
];

// ─── Status legend ────────────────────────────────────────────────────────────

const LEGEND = [
  { dot: 'bg-success', label: 'Disponible', desc: 'Libre para nuevas ventas' },
  { dot: 'bg-info', label: 'Reservado', desc: 'Apartado por cotización B2B aprobada' },
  { dot: 'bg-error', label: 'Sin stock', desc: '0 unidades físicas' },
  { dot: 'bg-warning', label: 'Stock bajo', desc: 'Por debajo del mínimo definido' },
];

// ─── Expandable row B2B ───────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; color: 'success' | 'warning' | 'info' }> = {
  approved: { label: 'Aprobado', color: 'success' },
  in_process: { label: 'En proceso', color: 'info' },
  pending: { label: 'Pendiente', color: 'warning' },
};

function B2BExpandedRow({ productId }: { productId: string }) {
  const reservations = MOCK_B2B_RESERVATIONS.filter((r) => r.productId === productId);

  if (reservations.length === 0) {
    return (
      <p className="text-body2 text-muted-foreground py-3">
        Sin reservas B2B activas para este producto.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {reservations.map((r) => {
        const s = STATUS_LABEL[r.status];
        return (
          <div
            key={r.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-caption text-muted-foreground">Nº Cotización</p>
                <p className="text-subtitle2 text-primary font-medium">{r.quoteNumber}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Cliente</p>
                <p className="text-subtitle2 text-foreground">{r.client}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Aprobado</p>
                <p className="text-subtitle2 text-foreground">
                  {new Date(r.approvedAt).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-subtitle2 font-bold text-foreground">{r.reserved} uds</p>
              <Badge variant="soft" color={s.color}>
                {s.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Product>();

// ─── Main View ────────────────────────────────────────────────────────────────

export function StockView() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const status = getProductStockStatus(p);
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      const matchWarehouse =
        filterWarehouse === 'all' ||
        (filterWarehouse === 'main' && p.stockMain > 0) ||
        (filterWarehouse === 'store' && p.stockStore > 0);
      return matchSearch && matchCategory && matchStatus && matchWarehouse;
    });
  }, [search, filterCategory, filterStatus, filterWarehouse]);

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        header: '',
        cell: (info) => {
          const isOpen = expandedRows.has(info.row.original.id);
          const hasReservations = MOCK_B2B_RESERVATIONS.some(
            (r) => r.productId === info.row.original.id
          );
          if (!hasReservations) return null;
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
        cell: (info) => (
          <Badge variant="soft" color="secondary">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.stockMain + row.stockStore, {
        id: 'physical',
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
      columnHelper.accessor((row) => getProductAvailable(row), {
        id: 'available',
        header: () => (
          <div className="text-right w-full font-bold text-foreground">Disponible real</div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            <div
              className={cn(
                'text-right font-bold text-base',
                val <= 0 ? 'text-error' : 'text-success'
              )}
            >
              {val}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => getProductStockStatus(row), {
        id: 'status',
        header: 'Estado',
        cell: (info) => <StockBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'action',
        header: '',
        cell: (info) => (
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => toggleRow(info.row.original.id)}
          >
            Ver reservas
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

  return (
    <PageContainer>
      <PageHeader
        title="Stock & Disponibilidad"
        subtitle="Visibilidad completa del stock disponible para comprometer"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-card rounded-2xl px-6 py-5 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('p-2.5 rounded-xl shrink-0', card.iconClassName)}>
                  {card.icon}
                </div>
                <p className="text-3xl font-bold text-foreground leading-none tabular-nums tracking-tight">
                  {card.value}
                </p>
              </div>
              {card.badge && (
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap mt-0.5',
                    card.badgeClass
                  )}
                >
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
            <span className="text-caption text-muted-foreground hidden sm:inline">
              — {item.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <SectionCard noPadding>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
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
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
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
                  <TableRow className="border-border/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn('px-5', dense ? 'py-2' : 'py-3.5')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && (
                    <TableRow className="bg-muted/10 border-border/40">
                      <TableCell colSpan={row.getVisibleCells().length} className="px-8 py-3">
                        <B2BExpandedRow productId={row.original.id} />
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
    </PageContainer>
  );
}
