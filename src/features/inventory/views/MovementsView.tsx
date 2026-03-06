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
import { MOCK_MOVEMENTS, MOCK_PRODUCTS, type WarehouseMovement } from 'src/_mock/_inventories';

// ─── Stats ────────────────────────────────────────────────────────────────────

const currentMonth = new Date().getMonth();
const thisMonthMovements = MOCK_MOVEMENTS.filter(
  (m) => new Date(m.date).getMonth() === currentMonth
);
const mainToStore = thisMonthMovements.filter((m) => m.from === 'main' && m.to === 'store').length;
const storeToMain = thisMonthMovements.filter((m) => m.from === 'store' && m.to === 'main').length;
const totalUnits = thisMonthMovements.reduce((sum, m) => sum + m.quantity, 0);

const totalMov = thisMonthMovements.length;
const pctMainToStore = totalMov > 0 ? Math.round((mainToStore / totalMov) * 100) : 0;
const pctStoreToMain = totalMov > 0 ? Math.round((storeToMain / totalMov) * 100) : 0;

const statsCards = [
  {
    title: 'Movimientos este mes',
    value: thisMonthMovements.length,
    icon: <Icon name="ArrowLeftRight" size={18} />,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    title: 'Unidades trasladadas',
    value: totalUnits,
    icon: <Icon name="Package" size={18} />,
    iconClassName: 'bg-success/10 text-success',
  },
  {
    title: 'Principal → Tienda',
    value: mainToStore,
    badge: `${pctMainToStore}% del total`,
    badgeClass: 'bg-info/10 text-info',
    icon: <Icon name="ArrowRight" size={18} />,
    iconClassName: 'bg-info/10 text-info',
  },
  {
    title: 'Tienda → Principal',
    value: storeToMain,
    badge: `${pctStoreToMain}% del total`,
    badgeClass: 'bg-warning/10 text-warning',
    icon: <Icon name="ArrowLeft" size={18} />,
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
      newErrors.quantity = `Stock insuficiente (disponible: ${availableInOrigin})`;
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
          <div className="space-y-1.5">
            <Label>Producto *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className={cn(errors.product && 'border-error')}>
                <SelectValue placeholder="Seleccionar producto..." />
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

          <div className="space-y-1.5">
            <Label>Bodega destino</Label>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-body2 text-muted-foreground">
              {to === 'main' ? 'Bodega Principal' : 'Tienda'}{' '}
              <span className="text-caption">(automático)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qty-mov">Cantidad *</Label>
            <Input
              id="qty-mov"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={cn(errors.quantity && 'border-error')}
            />
            {errors.quantity && <p className="text-caption text-error">{errors.quantity}</p>}
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

          <div className="space-y-1.5">
            <Label htmlFor="comment-mov">Comentario (opcional)</Label>
            <Textarea
              id="comment-mov"
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

const columnHelper = createColumnHelper<WarehouseMovement>();

const COLUMNS = [
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
  columnHelper.accessor('productName', {
    header: 'Producto',
    cell: (info) => (
      <div>
        <p className="text-subtitle2 text-foreground">{info.getValue()}</p>
        <p className="text-caption text-muted-foreground font-mono">
          {info.row.original.productSku}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor('from', {
    header: 'Origen',
    cell: (info) => (
      <Badge variant="soft" color="secondary">
        {info.getValue() === 'main' ? 'B. Principal' : 'Tienda'}
      </Badge>
    ),
  }),
  columnHelper.accessor('to', {
    header: 'Destino',
    cell: (info) => (
      <Badge variant="soft" color="info">
        {info.getValue() === 'main' ? 'B. Principal' : 'Tienda'}
      </Badge>
    ),
  }),
  columnHelper.accessor('quantity', {
    header: () => <div className="text-right w-full">Cantidad</div>,
    cell: (info) => (
      <div className="text-right font-semibold text-foreground">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor('comment', {
    header: 'Comentario',
    cell: (info) => (
      <span className="text-body2 text-muted-foreground">{info.getValue() || '—'}</span>
    ),
  }),
  columnHelper.accessor('registeredBy', {
    header: 'Registrado por',
    cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
  }),
];

// ─── Main View ────────────────────────────────────────────────────────────────

export function MovementsView() {
  const [search, setSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('all');
  const [filterTo, setFilterTo] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_MOVEMENTS.filter((m) => {
      const matchSearch =
        !search ||
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.productSku.toLowerCase().includes(search.toLowerCase());
      const matchFrom = filterFrom === 'all' || m.from === filterFrom;
      const matchTo = filterTo === 'all' || m.to === filterTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [search, filterFrom, filterTo]);

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 20,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Movimientos entre Bodegas"
        subtitle="Historial de traslados registrados"
        action={
          <Button color="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Registrar traslado
          </Button>
        }
      />

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

      <SectionCard noPadding>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterFrom} onValueChange={setFilterFrom}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Bodega origen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier origen</SelectItem>
              <SelectItem value="main">B. Principal</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTo} onValueChange={setFilterTo}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Bodega destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier destino</SelectItem>
              <SelectItem value="main">B. Principal</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
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
