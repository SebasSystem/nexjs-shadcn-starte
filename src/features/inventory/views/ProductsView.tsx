'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Badge,
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SelectField,
  Switch,
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
import { MOCK_CATEGORIES } from 'src/_mock/_inventories';
import { StockBadge } from '../components/StockBadge';
import { ACTION_ICONS } from 'src/shared/constants/app-icons';
import { useInventory, type RichProduct } from '../hooks/useInventory';
import { toast } from 'sonner';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<RichProduct>();

// ─── Drawer ───────────────────────────────────────────────────────────────────

type DrawerMode = 'create' | 'edit';

interface ProductDrawerProps {
  open: boolean;
  mode: DrawerMode;
  product?: RichProduct | null;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    sku: string;
    category: string;
    unit: string;
    minStock: number;
    status: 'active' | 'inactive';
    stockMainInit: number;
    stockStoreInit: number;
  }) => void;
  onUpdate: (productId: string, changes: Partial<RichProduct>) => void;
}

function ProductDrawer({ open, mode, product, onClose, onCreate, onUpdate }: ProductDrawerProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [unit, setUnit] = useState(product?.unit ?? 'Unidad');
  const [minStock, setMinStock] = useState(String(product?.minStock ?? 0));
  const [active, setActive] = useState(product ? product.status === 'active' : true);
  const [stockMain, setStockMain] = useState('0');
  const [stockStore, setStockStore] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!sku.trim()) newErrors.sku = 'El SKU es requerido';
    if (mode === 'create' && Number(stockMain) < 0) newErrors.stockMain = 'No puede ser negativo';
    if (mode === 'create' && Number(stockStore) < 0) newErrors.stockStore = 'No puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    if (mode === 'create') {
      onCreate({
        name,
        sku,
        category: category || MOCK_CATEGORIES[0].name,
        unit,
        minStock: Number(minStock),
        status: active ? 'active' : 'inactive',
        stockMainInit: Number(stockMain),
        stockStoreInit: Number(stockStore),
      });
      toast.success('Producto creado correctamente');
    } else if (product) {
      onUpdate(product.id, {
        name,
        sku,
        category,
        unit,
        minStock: Number(minStock),
        status: active ? 'active' : 'inactive',
      });
      toast.success('Producto actualizado');
    }

    setLoading(false);
    onClose();
  };

  const isEdit = mode === 'edit';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <Input
            label="Nombre del producto *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Camiseta Básica XL"
            error={errors.name}
          />

          <Input
            label="SKU / Código *"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ej: SKU-001-XL"
            error={errors.sku}
          />

          <SelectField
            label="Categoría"
            options={MOCK_CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
            value={category}
            onChange={(v) => setCategory(v as string)}
            placeholder="Seleccionar categoría"
          />

          <SelectField
            label="Unidad de medida"
            options={['Unidad', 'Caja', 'Par', 'Pack', 'Kg', 'L'].map((u) => ({
              value: u,
              label: u,
            }))}
            value={unit}
            onChange={(v) => setUnit(v as string)}
          />

          <Input
            label="Stock mínimo (umbral de alerta)"
            type="number"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />

          {/* Estado toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium leading-none">Estado</p>
              <p className="text-caption text-muted-foreground mt-0.5">
                {active ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {/* Stock inicial (solo create) */}
          {!isEdit && (
            <div className="rounded-xl border border-border/60 p-4 space-y-4 bg-muted/20">
              <p className="text-subtitle2 text-foreground font-semibold">Stock inicial</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Bodega Principal"
                  type="number"
                  min={0}
                  value={stockMain}
                  onChange={(e) => setStockMain(e.target.value)}
                  error={errors.stockMain}
                />
                <Input
                  label="Tienda"
                  type="number"
                  min={0}
                  value={stockStore}
                  onChange={(e) => setStockStore(e.target.value)}
                  error={errors.stockStore}
                />
              </div>
              <p className="text-caption text-muted-foreground">
                El stock podrá ajustarse después desde la vista de movimientos.
              </p>
            </div>
          )}

          {/* Zona de peligro (solo edit) */}
          {isEdit && (
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
                  onUpdate(product!.id, { status: 'inactive' });
                  toast.success('Producto inactivado');
                  onClose();
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
  const { products, stats, createProduct, updateProduct } = useInventory();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [selectedProduct, setSelectedProduct] = useState<RichProduct | null>(null);

  const statsCards = [
    {
      title: 'Total productos',
      value: stats.totalProducts,
      badge: 'en catálogo',
      badgeClass: 'bg-primary/10 text-primary',
      icon: <Icon name="Package" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Productos activos',
      value: stats.activeProducts,
      badge: `${stats.totalProducts > 0 ? Math.round((stats.activeProducts / stats.totalProducts) * 100) : 0}% del total`,
      badgeClass: 'bg-success/10 text-success',
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Productos sin stock',
      value: stats.outOfStock,
      badge: `${stats.totalProducts > 0 ? Math.round((stats.outOfStock / stats.totalProducts) * 100) : 0}% del total`,
      badgeClass: 'bg-error/10 text-error',
      icon: <Icon name="XCircle" size={18} />,
      iconClassName: 'bg-error/10 text-error',
    },
    {
      title: 'Categorías',
      value: MOCK_CATEGORIES.length,
      badge: 'disponibles',
      badgeClass: 'bg-info/10 text-info',
      icon: <Icon name="Tag" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'available' && p.stockStatus === 'available') ||
        (filterStatus === 'out_of_stock' && p.stockStatus === 'out_of_stock') ||
        (filterStatus === 'low_stock' && p.stockStatus === 'low_stock') ||
        (filterStatus === 'inactive' && p.status === 'inactive');
      const matchWarehouse =
        filterWarehouse === 'all' ||
        (filterWarehouse === 'main' && p.stockMain > 0) ||
        (filterWarehouse === 'store' && p.stockStore > 0);
      return matchSearch && matchCategory && matchStatus && matchWarehouse;
    });
  }, [products, search, filterCategory, filterStatus, filterWarehouse]);

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
          <Badge variant="soft" color="secondary">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('physical', {
        header: () => <div className="text-right w-full">Stock total</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
        ),
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
        header: () => <div className="text-right w-full">Reservado</div>,
        cell: (info) => <div className="text-right text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('available', {
        header: () => <div className="text-right w-full font-semibold">Disponible real</div>,
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className={cn('text-right font-bold', val <= 0 ? 'text-error' : 'text-success')}>
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

      {/* Filters + Table */}
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
              ...MOCK_CATEGORIES.map((c) => ({ value: c.name, label: c.name })),
            ]}
            value={filterCategory}
            onChange={(v) => setFilterCategory(v as string)}
          />

          <SelectField
            label="Estado"
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'available', label: 'Activo' },
              { value: 'out_of_stock', label: 'Sin stock' },
              { value: 'low_stock', label: 'Stock bajo' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as string)}
          />

          <SelectField
            label="Bodega"
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'main', label: 'Principal' },
              { value: 'store', label: 'Tienda' },
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
        onClose={() => setDrawerOpen(false)}
        onCreate={createProduct}
        onUpdate={updateProduct}
      />
    </PageContainer>
  );
}
