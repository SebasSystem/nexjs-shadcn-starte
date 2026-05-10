'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { endpoints } from 'src/lib/axios';
import { downloadExport } from 'src/lib/export-service';
import { cn } from 'src/lib/utils';
import { ExportDropdown } from 'src/shared/components/export/ExportDropdown';
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
import { useWarehouses } from '../hooks/use-warehouses';
import type { CreateProductPayload, InventoryMasterItem } from '../types/inventory.types';

const columnHelper = createColumnHelper<InventoryMasterItem>();

export function ProductsView() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<ProductDrawerMode>('create');
  const [selectedProduct, setSelectedProduct] = useState<InventoryMasterItem | null>(null);
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

  const stock_state = ['normal', 'low', 'out'].includes(filterStatus)
    ? (filterStatus as 'normal' | 'low' | 'out')
    : undefined;

  const { items, summary, categories, isLoading, createProduct, updateProduct, pagination } =
    useProducts({
      category_uid: filterCategory !== 'all' ? filterCategory : undefined,
      warehouse_uid: filterWarehouse !== 'all' ? filterWarehouse : undefined,
      stock_state,
    });

  const { items: warehouseItems } = useWarehouses();
  const warehouseOptions = useMemo(
    () => warehouseItems.map((w) => ({ uid: w.uid, name: w.name })),
    [warehouseItems]
  );

  const statsCards = summary
    ? [
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
      ]
    : [];

  // Only search and inactive status are frontend-only filters
  // category_uid, warehouse_uid and stock_state are handled by the backend
  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchInactive = filterStatus !== 'inactive' || !p.is_active;
      return matchSearch && matchInactive;
    });
  }, [items, search, filterStatus]);

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
    total: pagination.total,
    pageIndex: pagination.page - 1,
    pageSize: pagination.rowsPerPage,
    onPageChange: (pi: number) => pagination.onChangePage(pi + 1),
    onPageSizeChange: pagination.onChangeRowsPerPage,
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

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportLoading(format);
    try {
      await downloadExport({
        endpoint: endpoints.productsExport,
        format,
        filters: {
          search,
          category_uid: filterCategory !== 'all' ? filterCategory : undefined,
          warehouse_uid: filterWarehouse !== 'all' ? filterWarehouse : undefined,
          is_active: filterStatus !== 'all' ? filterStatus === 'active' : undefined,
        },
        filename: `productos.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      });
    } finally {
      setExportLoading(null);
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
          <div className="flex items-center gap-2">
            <ExportDropdown onExport={handleExport} loading={exportLoading} />
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
          </div>
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
          warehouses={warehouseOptions}
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
          <TablePaginationCustom
            table={table}
            total={pagination.total}
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </div>
      </SectionCard>

      <ProductDrawer
        open={drawerOpen}
        mode={drawerMode}
        product={selectedProduct}
        categories={categories}
        warehouses={warehouseOptions}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </PageContainer>
  );
}
