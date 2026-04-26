'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Button,
  Input,
  SelectField,
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
import { cn } from 'src/lib/utils';
import { MOCK_CATEGORIES, type Product } from 'src/_mock/_inventories';
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
      badge: 'activas',
      badgeClass: 'bg-primary/10 text-primary',
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
      badge: 'en inventario',
      badgeClass: 'bg-warning/10 text-warning',
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
        cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
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
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            trend={card.badge}
            trendUp
          />
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
              {maxUnits > 0 ? Math.round((bodega.units / maxUnits) * 100) : 0}% de la capacidad
              relativa
            </p>
          </SectionCard>
        ))}
      </div>

      {/* Comparative table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="flex-1 min-w-48">
            <Input
              label="Buscar"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="Search" size={15} />}
            />
          </div>

          <SelectField
            label="Categoría"
            options={[
              { value: 'all', label: 'Todas' },
              ...MOCK_CATEGORIES.map((c) => ({ value: c.name, label: c.name })),
            ]}
            value={filterCategory}
            onChange={(v) => setFilterCategory(v as string)}
          />

          <SelectField
            label="Stock"
            options={[
              { value: 'all', label: 'Todos los productos' },
              { value: 'with_stock', label: 'Solo con stock' },
            ]}
            value={filterStock}
            onChange={(v) => setFilterStock(v as string)}
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

      <TransferDrawer open={transferOpen} onClose={() => setTransferOpen(false)} />
      <GoodsReceiptDrawer open={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </PageContainer>
  );
}
