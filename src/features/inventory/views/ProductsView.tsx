'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from 'src/lib/utils';
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
import { Badge, Button, EditButton, Icon } from 'src/shared/components/ui';

import { InventoryPageSkeleton } from '../components/InventoryPageSkeleton';
import { ProductDrawer, type ProductDrawerMode } from '../components/ProductDrawer';
import { ProductFilters } from '../components/ProductFilters';
import { StockBadge } from '../components/StockBadge';
import { useProducts } from '../hooks/use-products';
import type { CreateProductPayload, InventoryMasterItem } from '../types/inventory.types';

const columnHelper = createColumnHelper<InventoryMasterItem>();

export function ProductsView() {
  const { items, summary, categories, isLoading, createProduct, updateProduct } = useProducts();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<ProductDrawerMode>('create');
  const [selectedProduct, setSelectedProduct] = useState<InventoryMasterItem | null>(null);

  const statsCards = [
    {
      title: 'Total productos',
      value: summary.products,
      badge: 'en catálogo',
      icon: <Icon name="Package" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Productos activos',
      value: summary.active_products,
      badge: `${summary.products > 0 ? Math.round((summary.active_products / summary.products) * 100) : 0}% del total`,
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Productos sin stock',
      value: summary.out_of_stock_count,
      badge: `${summary.products > 0 ? Math.round((summary.out_of_stock_count / summary.products) * 100) : 0}% del total`,
      icon: <Icon name="XCircle" size={18} />,
      iconClassName: 'bg-error/10 text-error',
    },
    {
      title: 'Categorías',
      value: categories.length,
      badge: 'disponibles',
      icon: <Icon name="Tag" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
  ];

  const allWarehouses = useMemo(() => {
    const map = new Map<string, { uid: string; name: string }>();
    items.forEach((p) =>
      p.stocks.forEach((s) =>
        map.set(s.warehouse_uid, { uid: s.warehouse_uid, name: s.warehouse.name })
      )
    );
    return Array.from(map.values());
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category_uid === filterCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'inactive' ? !p.is_active : p.stock_state === filterStatus);
      const matchWarehouse =
        filterWarehouse === 'all' ||
        p.stocks.some((s) => s.warehouse_uid === filterWarehouse && s.physical_stock > 0);
      return matchSearch && matchCategory && matchStatus && matchWarehouse;
    });
  }, [items, search, filterCategory, filterStatus, filterWarehouse]);

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
      columnHelper.accessor('category_name', {
        header: 'Categoría',
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="soft" color="secondary">
              {info.getValue()}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      }),
      columnHelper.accessor('stock_physical_total', {
        header: () => <div className="text-right w-full">Stock total</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor('stock_reserved_total', {
        header: () => <div className="text-right w-full">Reservado</div>,
        cell: (info) => <div className="text-right text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('stock_available_total', {
        header: () => <div className="text-right w-full font-semibold">Disponible</div>,
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className={cn('text-right font-bold', val <= 0 ? 'text-error' : 'text-success')}>
              {val}
            </div>
          );
        },
      }),
      columnHelper.accessor('stock_state', {
        header: 'Estado',
        cell: (info) => <StockBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <EditButton
            onClick={() => {
              setSelectedProduct(info.row.original);
              setDrawerMode('edit');
              setDrawerOpen(true);
            }}
          />
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

  const handleSave = async (payload: CreateProductPayload) => {
    if (drawerMode === 'create') {
      await createProduct(payload);
      toast.success('Producto creado');
    } else if (selectedProduct) {
      await updateProduct(selectedProduct.uid, payload);
      toast.success('Producto actualizado');
    }
  };

  if (isLoading)
    return (
      <InventoryPageSkeleton title="Productos" subtitle="Gestión del catálogo de inventario" />
    );

  return (
    <PageContainer>
      <PageHeader
        title="Productos"
        subtitle="Gestión del catálogo de inventario"
        action={
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              setSelectedProduct(null);
              setDrawerMode('create');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Plus" size={16} />
            Nuevo producto
          </Button>
        }
      />

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

      <SectionCard noPadding>
        <ProductFilters
          search={search}
          onSearch={setSearch}
          filterCategory={filterCategory}
          onFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          onFilterStatus={setFilterStatus}
          filterWarehouse={filterWarehouse}
          onFilterWarehouse={setFilterWarehouse}
          categories={categories}
          warehouses={allWarehouses}
        />
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

      <ProductDrawer
        open={drawerOpen}
        mode={drawerMode}
        product={selectedProduct}
        categories={categories}
        warehouses={allWarehouses}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </PageContainer>
  );
}
