'use client';

import { useState, useMemo } from 'react';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Textarea,
} from 'src/shared/components/ui';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_MOVEMENTS,
  getProductStockStatus,
  type Product,
} from 'src/_mock/_inventories';
import { StockBadge } from '../components/StockBadge';

// ─── Stats ────────────────────────────────────────────────────────────────────

const todayStr = new Date().toDateString();
const movementsToday = MOCK_MOVEMENTS.filter(
  (m) => new Date(m.date).toDateString() === todayStr
).length;

const skusMain = MOCK_PRODUCTS.filter((p) => p.stockMain > 0).length;
const skusStore = MOCK_PRODUCTS.filter((p) => p.stockStore > 0).length;
const totalCatalog = MOCK_PRODUCTS.length;
const pctMain = totalCatalog > 0 ? Math.round((skusMain / totalCatalog) * 100) : 0;
const pctStore = totalCatalog > 0 ? Math.round((skusStore / totalCatalog) * 100) : 0;

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
    badge: `${pctMain}% del catálogo`,
    badgeClass: 'bg-success/10 text-success',
    icon: <Icon name="Package" size={18} />,
    iconClassName: 'bg-success/10 text-success',
  },
  {
    title: 'SKUs en Tienda',
    value: skusStore,
    badge: `${pctStore}% del catálogo`,
    badgeClass: 'bg-info/10 text-info',
    icon: <Icon name="Store" size={18} />,
    iconClassName: 'bg-info/10 text-info',
  },
  {
    title: 'Movimientos hoy',
    value: movementsToday,
    icon: <Icon name="ArrowLeftRight" size={18} />,
    iconClassName: 'bg-warning/10 text-warning',
  },
];

// ─── Transfer Drawer ──────────────────────────────────────────────────────────

interface TransferDrawerProps {
  open: boolean;
  onClose: () => void;
}

function TransferDrawer({ open, onClose }: TransferDrawerProps) {
  const [productId, setProductId] = useState('');
  const [from, setFrom] = useState<'main' | 'store'>('main');
  const [quantity, setQuantity] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
  const to: 'main' | 'store' = from === 'main' ? 'store' : 'main';
  const availableInOrigin = selectedProduct
    ? from === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockStore
    : 0;
  const qty = Number(quantity);
  const afterOrigin = availableInOrigin - qty;
  const afterDest = selectedProduct
    ? (to === 'main' ? selectedProduct.stockMain : selectedProduct.stockStore) + qty
    : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!productId) newErrors.product = 'Selecciona un producto';
    if (!quantity || qty <= 0) newErrors.quantity = 'Ingresa una cantidad válida';
    else if (qty > availableInOrigin)
      newErrors.quantity = `Stock insuficiente en ${from === 'main' ? 'Bodega Principal' : 'Tienda'} (disponible: ${availableInOrigin})`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Registrar traslado</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Producto */}
          <div className="space-y-1.5">
            <Label>Producto *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className={cn(errors.product && 'border-error')}>
                <SelectValue placeholder="Buscar producto..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PRODUCTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.sku}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product && <p className="text-caption text-error">{errors.product}</p>}

            {/* Stock inline */}
            {selectedProduct && (
              <div className="flex gap-3 mt-2">
                <div className="flex-1 rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-caption text-muted-foreground">B. Principal</p>
                  <p className="text-subtitle2 font-bold text-foreground">
                    {selectedProduct.stockMain} uds
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Tienda</p>
                  <p className="text-subtitle2 font-bold text-foreground">
                    {selectedProduct.stockStore} uds
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bodega origen */}
          <div className="space-y-1.5">
            <Label>Bodega origen *</Label>
            <Select value={from} onValueChange={(v) => setFrom(v as 'main' | 'store')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Bodega Principal</SelectItem>
                <SelectItem value="store">Tienda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bodega destino (auto) */}
          <div className="space-y-1.5">
            <Label>Bodega destino</Label>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-body2 text-muted-foreground">
              {to === 'main' ? 'Bodega Principal' : 'Tienda'}{' '}
              <span className="text-caption">(automático)</span>
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <Label htmlFor="transfer-qty">Cantidad a trasladar *</Label>
            <Input
              id="transfer-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={cn(errors.quantity && 'border-error')}
            />
            {errors.quantity && <p className="text-caption text-error">{errors.quantity}</p>}

            {/* Preview */}
            {selectedProduct && qty > 0 && qty <= availableInOrigin && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 mt-2">
                <p className="text-caption text-primary font-medium">Vista previa:</p>
                <p className="text-caption text-muted-foreground mt-1">
                  Quedarán <span className="font-semibold text-foreground">{afterOrigin}</span> uds
                  en {from === 'main' ? 'Bodega Principal' : 'Tienda'} y{' '}
                  <span className="font-semibold text-foreground">{afterDest}</span> uds en{' '}
                  {to === 'main' ? 'Bodega Principal' : 'Tienda'}.
                </p>
              </div>
            )}
          </div>

          {/* Comentario */}
          <div className="space-y-1.5">
            <Label htmlFor="transfer-comment">Comentario (opcional)</Label>
            <Textarea
              id="transfer-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ej: Reposición semanal..."
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave} className="flex-1">
            Confirmar traslado
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Table columns ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Product>();

// ─── Main View ────────────────────────────────────────────────────────────────

export function WarehousesView() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalMain = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stockMain, 0);
  const totalStore = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stockStore, 0);
  const maxUnits = Math.max(totalMain, totalStore);

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchStock =
        filterStock === 'all' || (filterStock === 'with_stock' && p.stockMain + p.stockStore > 0);
      return matchSearch && matchCategory && matchStock;
    });
  }, [search, filterCategory, filterStock]);

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
      columnHelper.accessor((row) => getProductStockStatus(row), {
        id: 'status',
        header: 'Estado',
        cell: (info) => {
          const s = info.getValue();
          if (s === 'available') return null;
          return <StockBadge status={s} />;
        },
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
          <Button color="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Registrar movimiento
          </Button>
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

      {/* Warehouse cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: 'Bodega Principal',
            icon: 'Warehouse' as const,
            units: totalMain,
            skus: MOCK_PRODUCTS.filter((p) => p.stockMain > 0).length,
            color: 'bg-primary',
            textColor: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            name: 'Tienda Física',
            icon: 'Store' as const,
            units: totalStore,
            skus: MOCK_PRODUCTS.filter((p) => p.stockStore > 0).length,
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

      <TransferDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </PageContainer>
  );
}
