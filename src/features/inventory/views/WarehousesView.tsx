'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Table,
  TableBody,
  TableRow,
  TableCell,
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
import { MOCK_CATEGORIES, type Product } from 'src/_mock/_inventories';
import { StockBadge } from '../components/StockBadge';
import { TransferDrawer } from '../components/TransferDrawer';
import { GoodsReceiptDrawer } from '../components/GoodsReceiptDrawer';
import { useInventory } from '../hooks/useInventory';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Product>();

// ─── Main View ────────────────────────────────────────────────────────────────

export function WarehousesView() {
  const { products, warehouseStats } = useInventory();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { totalMain, totalStore, skusMain, skusStore } = warehouseStats;
  const maxUnits = Math.max(totalMain, totalStore);

  const statsCards = [
    {
      title: 'Total bodegas',
      value: 2,
      icon: <Icon name="Warehouse" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'SKUs en B. Principal',
      value: skusMain,
      badge: `${products.length > 0 ? Math.round((skusMain / products.length) * 100) : 0}% del catálogo`,
      badgeClass: 'bg-success/10 text-success',
      icon: <Icon name="Package" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'SKUs en Tienda',
      value: skusStore,
      badge: `${products.length > 0 ? Math.round((skusStore / products.length) * 100) : 0}% del catálogo`,
      badgeClass: 'bg-info/10 text-info',
      icon: <Icon name="Store" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Total unidades en sistema',
      value: (totalMain + totalStore).toLocaleString(),
      icon: <Icon name="BarChart3" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchStock =
        filterStock === 'all' || (filterStock === 'with_stock' && p.stockMain + p.stockStore > 0);
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, search, filterCategory, filterStock]);

  const COLUMNS = useMemo(
    () => [
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
          <span className="text-body2 text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('stockMain', {
        header: () => <div className="text-right w-full">B. Principal</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor('stockStore', {
        header: () => <div className="text-right w-full">Tienda</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor((row) => row.stockMain + row.stockStore, {
        id: 'total',
        header: () => <div className="text-right w-full font-semibold">Total</div>,
        cell: (info) => (
          <div className="text-right font-bold text-foreground">{info.getValue()}</div>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 20,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Vista General de Bodegas"
        subtitle="Estado actual del stock por bodega"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <Icon name="ArrowLeftRight" size={15} />
              Registrar traslado
            </Button>
            <Button color="primary" size="sm" onClick={() => setReceiptOpen(true)}>
              <Icon name="PackagePlus" size={15} />
              Entrada de mercancía
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
                <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap mt-0.5', card.badgeClass)}>
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Warehouse cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: 'Bodega Principal',
            icon: 'Warehouse' as const,
            units: totalMain,
            skus: skusMain,
            color: 'bg-primary',
            textColor: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            name: 'Tienda Física',
            icon: 'Store' as const,
            units: totalStore,
            skus: skusStore,
            color: 'bg-info',
            textColor: 'text-info',
            bgColor: 'bg-info/10',
          },
        ].map((bodega) => (
          <SectionCard key={bodega.name}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2.5 rounded-xl', bodega.bgColor)}>
                  <Icon name={bodega.icon} size={20} className={bodega.textColor} />
                </div>
                <div>
                  <h3 className="text-h6 font-semibold text-foreground">{bodega.name}</h3>
                  <p className="text-caption text-muted-foreground">{bodega.skus} SKUs distintos</p>
                </div>
              </div>
              <p className="text-h4 font-bold text-foreground">
                {bodega.units.toLocaleString()}
                <span className="text-caption text-muted-foreground font-normal ml-1">uds</span>
              </p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', bodega.color)}
                style={{ width: `${maxUnits > 0 ? (bodega.units / maxUnits) * 100 : 0}%` }}
              />
            </div>
            <p className="text-caption text-muted-foreground mt-2">
              {maxUnits > 0 ? Math.round((bodega.units / maxUnits) * 100) : 0}% de la capacidad relativa
            </p>
          </SectionCard>
        ))}
      </div>

      {/* Comparative table */}
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

          <Select value={filterStock} onValueChange={setFilterStock}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              <SelectItem value="with_stock">Solo con stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('px-5', dense ? 'py-2' : 'py-3.5')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
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
