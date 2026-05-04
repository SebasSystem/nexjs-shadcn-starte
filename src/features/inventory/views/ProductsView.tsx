'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
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
import {
  Badge,
  Button,
  Icon,
  Input,
  SelectField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from 'src/shared/components/ui';
import { ACTION_ICONS } from 'src/shared/constants/app-icons';

import { InventoryPageSkeleton } from '../components/InventoryPageSkeleton';
import { StockBadge } from '../components/StockBadge';
import { useProducts } from '../hooks/use-products';
import type { CreateProductPayload, InventoryMasterItem } from '../types/inventory.types';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<InventoryMasterItem>();

// ─── Product Drawer ───────────────────────────────────────────────────────────

type DrawerMode = 'create' | 'edit';

interface ProductDrawerProps {
  open: boolean;
  mode: DrawerMode;
  product?: InventoryMasterItem | null;
  categories: { uid: string; name: string }[];
  warehouses: { uid: string; name: string }[];
  onClose: () => void;
  onSave: (payload: CreateProductPayload) => Promise<void>;
}

function ProductDrawer({
  open,
  mode,
  product,
  categories,
  warehouses,
  onClose,
  onSave,
}: ProductDrawerProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [categoryUid, setCategoryUid] = useState(product?.category_uid ?? '');
  const [reorderPoint, setReorderPoint] = useState(String(product?.reorder_point ?? 0));
  const [active, setActive] = useState(product ? product.is_active : true);
  const [warehouseStocks, setWarehouseStocks] = useState<Record<string, string>>(
    Object.fromEntries(warehouses.map((w) => [w.uid, '0']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(product?.name ?? '');
    setSku(product?.sku ?? '');
    setCategoryUid(product?.category_uid ?? '');
    setReorderPoint(String(product?.reorder_point ?? 0));
    setActive(product ? product.is_active : true);
    setWarehouseStocks(Object.fromEntries(warehouses.map((w) => [w.uid, '0'])));
    setErrors({});
  }, [open, product]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'El nombre es requerido';
    if (!sku.trim()) next.sku = 'El SKU es requerido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: CreateProductPayload = {
        name,
        sku,
        category_uid: categoryUid || undefined,
        reorder_point: Number(reorderPoint),
        is_active: active,
      };

      if (mode === 'create') {
        payload.warehouse_stocks = warehouses
          .filter((w) => Number(warehouseStocks[w.uid]) > 0)
          .map((w) => ({ warehouse_uid: w.uid, quantity: Number(warehouseStocks[w.uid]) }));
      }

      await onSave(payload);
      onClose();
    } catch {
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>{mode === 'edit' ? 'Editar producto' : 'Nuevo producto'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <Input
            label="Nombre del producto *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Camiseta Básica XL"
            error={errors.name}
          />

          <Input
            label="SKU / Código *"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ej: SKU-001-XL"
            error={errors.sku}
          />

          <SelectField
            label="Categoría"
            options={[
              { value: '', label: 'Sin categoría' },
              ...categories.map((c) => ({ value: c.uid, label: c.name })),
            ]}
            value={categoryUid}
            onChange={(v) => setCategoryUid(v as string)}
          />

          <Input
            label="Stock mínimo (umbral de alerta)"
            type="number"
            min={0}
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
          />

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium leading-none">Estado</p>
              <p className="text-caption text-muted-foreground mt-0.5">
                {active ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {mode === 'create' && warehouses.length > 0 && (
            <div className="rounded-xl border border-border/60 p-4 space-y-4 bg-muted/20">
              <p className="text-subtitle2 text-foreground font-semibold">
                Stock inicial por bodega
              </p>
              {warehouses.map((w) => (
                <Input
                  key={w.uid}
                  label={w.name}
                  type="number"
                  min={0}
                  value={warehouseStocks[w.uid] ?? '0'}
                  onChange={(e) =>
                    setWarehouseStocks((prev) => ({ ...prev, [w.uid]: e.target.value }))
                  }
                />
              ))}
              <p className="text-caption text-muted-foreground">
                El stock podrá ajustarse después desde movimientos.
              </p>
            </div>
          )}

          {mode === 'edit' && (
            <div className="rounded-xl border border-error/20 p-4 bg-error/5">
              <p className="text-subtitle2 text-error font-medium mb-1">Zona de peligro</p>
              <p className="text-caption text-muted-foreground mb-3">
                Inactivar el producto lo ocultará de los flujos de venta.
              </p>
              <Button
                variant="outline"
                color="error"
                size="sm"
                onClick={() => {
                  onSave({ name, sku, is_active: false }).then(() => onClose());
                }}
              >
                Inactivar producto
              </Button>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ProductsView() {
  const { items, summary, categories, isLoading, createProduct, updateProduct } = useProducts();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
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
      badgeClass: 'bg-info/10 text-info',
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
        (filterStatus === 'normal' && p.stock_state === 'normal') ||
        (filterStatus === 'low' && p.stock_state === 'low') ||
        (filterStatus === 'out' && p.stock_state === 'out') ||
        (filterStatus === 'inactive' && !p.is_active);
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
        header: 'Acciones',
        cell: (info) => (
          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={() => {
              setSelectedProduct(info.row.original);
              setDrawerMode('edit');
              setDrawerOpen(true);
            }}
          >
            <Icon name={ACTION_ICONS.EDIT} size={15} />
          </button>
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
              { value: 'all', label: 'Todas las categorías' },
              ...categories.map((c) => ({ value: c.uid, label: c.name })),
            ]}
            value={filterCategory}
            onChange={(v) => setFilterCategory(v as string)}
          />

          <SelectField
            label="Estado"
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Stock bajo' },
              { value: 'out', label: 'Sin stock' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as string)}
          />

          <SelectField
            label="Bodega"
            options={[
              { value: 'all', label: 'Todas' },
              ...allWarehouses.map((w) => ({ value: w.uid, label: w.name })),
            ]}
            value={filterWarehouse}
            onChange={(v) => setFilterWarehouse(v as string)}
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
