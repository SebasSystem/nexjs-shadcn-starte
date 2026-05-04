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
import {
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

import { InventoryPageSkeleton } from '../components/InventoryPageSkeleton';
import { GoodsReceiptDrawer } from '../components/GoodsReceiptDrawer';
import { TransferDrawer } from '../components/TransferDrawer';
import { useProducts } from '../hooks/use-products';
import { useWarehouses } from '../hooks/use-warehouses';
import type { CreateWarehousePayload, Warehouse } from '../types/inventory.types';

// ─── Column helper ────────────────────────────────────────────────────────────

interface WarehouseRow {
  warehouse: Warehouse;
}

const columnHelper = createColumnHelper<WarehouseRow>();

// ─── Warehouse Drawer ─────────────────────────────────────────────────────────

interface WarehouseDrawerProps {
  open: boolean;
  warehouse?: Warehouse | null;
  onClose: () => void;
  onSave: (payload: CreateWarehousePayload) => Promise<void>;
}

function WarehouseDrawer({ open, warehouse, onClose, onSave }: WarehouseDrawerProps) {
  const [name, setName] = useState(warehouse?.name ?? '');
  const [code, setCode] = useState(warehouse?.code ?? '');
  const [location, setLocation] = useState(warehouse?.location ?? '');
  const [active, setActive] = useState(warehouse?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'El nombre es requerido';
    if (!code.trim()) next.code = 'El código es requerido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ name, code, location: location || undefined, is_active: active });
      onClose();
    } catch {
      toast.error('Error al guardar la bodega');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!warehouse;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>{isEdit ? 'Editar bodega' : 'Nueva bodega'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <Input
            label="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Bodega Central"
            error={errors.name}
          />
          <Input
            label="Código *"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: MAIN, BCN01"
            error={errors.code}
          />
          <Input
            label="Ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: Calle Falsa 123"
          />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium leading-none">Estado</p>
              <p className="text-caption text-muted-foreground mt-0.5">
                {active ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
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

export function WarehousesView() {
  const { items: warehouses, summary: warehousesSummary, isLoading, createWarehouse, updateWarehouse } = useWarehouses();
  const { items: products } = useProducts();

  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [warehouseDrawerOpen, setWarehouseDrawerOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const maxPhysical = Math.max(...warehouses.map((w) => w.summary?.total_physical ?? 0), 1);

  const totalPhysical = warehouses.reduce((sum, w) => sum + (w.summary?.total_physical ?? 0), 0);
  const totalAvailable = warehouses.reduce((sum, w) => sum + (w.summary?.total_available ?? 0), 0);
  const totalValue = warehouses.reduce((sum, w) => sum + (w.summary?.total_value ?? 0), 0);

  const statsCards = [
    {
      title: 'Bodegas activas',
      value: warehousesSummary.active_warehouses,
      badge: 'habilitadas',
      icon: <Icon name="Warehouse" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Stock físico total',
      value: totalPhysical.toLocaleString(),
      badge: 'unidades en sistema',
      icon: <Icon name="Package" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Disponible total',
      value: totalAvailable.toLocaleString(),
      badge: 'para despacho',
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'Valor en stock',
      value: totalValue > 0 ? `$${totalValue.toLocaleString('es-AR')}` : '—',
      badge: 'costo de inventario',
      icon: <Icon name="DollarSign" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
  ];

  const warehouseRows: WarehouseRow[] = useMemo(
    () => warehouses.map((w) => ({ warehouse: w })),
    [warehouses]
  );

  const filtered = useMemo(() => {
    return warehouseRows.filter((r) => {
      const matchSearch =
        !search ||
        r.warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
        r.warehouse.code.toLowerCase().includes(search.toLowerCase());
      const matchStock =
        filterStock === 'all' ||
        (filterStock === 'with_stock' && (r.warehouse.summary?.total_physical ?? 0) > 0);
      return matchSearch && matchStock;
    });
  }, [warehouseRows, search, filterStock]);

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('warehouse', {
        header: 'Bodega',
        cell: (info) => {
          const w = info.getValue();
          return (
            <div>
              <p className="text-subtitle2 text-foreground">{w.name}</p>
              <p className="text-caption text-muted-foreground font-mono">{w.code}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor('warehouse', {
        id: 'location',
        header: 'Ubicación',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">
            {info.getValue().location ?? '—'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'sku_count',
        header: () => <div className="text-right w-full">SKUs</div>,
        cell: (info) => (
          <div className="text-right text-muted-foreground">
            {info.row.original.warehouse.summary?.sku_count ?? '—'}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'total_physical',
        header: () => <div className="text-right w-full">Stock Físico</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {info.row.original.warehouse.summary?.total_physical ?? '—'}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'total_available',
        header: () => <div className="text-right w-full font-semibold">Disponible</div>,
        cell: (info) => {
          const val = info.row.original.warehouse.summary?.total_available;
          return (
            <div className={cn('text-right font-bold', val != null && val <= 0 ? 'text-error' : 'text-success')}>
              {val ?? '—'}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'total_value',
        header: () => <div className="text-right w-full">Valor</div>,
        cell: (info) => {
          const val = info.row.original.warehouse.summary?.total_value;
          return (
            <div className="text-right text-muted-foreground text-sm">
              {val != null && val > 0 ? `$${val.toLocaleString('es-AR')}` : '—'}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'fill',
        header: 'Ocupación',
        cell: (info) => {
          const physical = info.row.original.warehouse.summary?.total_physical ?? 0;
          const pct = Math.round((physical / maxPhysical) * 100);
          return (
            <div className="w-28">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{pct}% del mayor</p>
            </div>
          );
        },
      }),
      columnHelper.accessor('warehouse', {
        id: 'status',
        header: 'Estado',
        cell: (info) => (
          <span
            className={cn(
              'text-xs font-semibold',
              info.getValue().is_active ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {info.getValue().is_active ? 'Activa' : 'Inactiva'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={() => {
              setSelectedWarehouse(info.row.original.warehouse);
              setWarehouseDrawerOpen(true);
            }}
          >
            <Icon name="Pencil" size={14} />
          </button>
        ),
      }),
    ],
    [maxPhysical]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 20,
  });

  const handleWarehouseSave = async (payload: CreateWarehousePayload) => {
    if (selectedWarehouse) {
      await updateWarehouse(selectedWarehouse.uid, payload);
      toast.success('Bodega actualizada');
    } else {
      await createWarehouse(payload);
      toast.success('Bodega creada');
    }
  };

  if (isLoading)
    return (
      <InventoryPageSkeleton
        title="Vista General de Bodegas"
        subtitle="Estado actual del stock por bodega"
      />
    );

  return (
    <PageContainer>
      <PageHeader
        title="Vista General de Bodegas"
        subtitle="Estado actual del stock por bodega"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWarehouse(null);
                setWarehouseDrawerOpen(true);
              }}
            >
              <Icon name="Plus" size={15} />
              Nueva bodega
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <Icon name="ArrowLeftRight" size={15} />
              Traslado
            </Button>
            <Button color="primary" size="sm" onClick={() => setReceiptOpen(true)}>
              <Icon name="PackagePlus" size={15} />
              Entrada
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

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="flex-1 min-w-48">
            <Input
              label="Buscar"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="Search" size={15} />}
            />
          </div>
          <SelectField
            label="Stock"
            options={[
              { value: 'all', label: 'Todas las bodegas' },
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

      <WarehouseDrawer
        open={warehouseDrawerOpen}
        warehouse={selectedWarehouse}
        onClose={() => setWarehouseDrawerOpen(false)}
        onSave={handleWarehouseSave}
      />
      <TransferDrawer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        warehouses={warehouses}
        products={products}
      />
      <GoodsReceiptDrawer
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        warehouses={warehouses}
        products={products}
      />
    </PageContainer>
  );
}
