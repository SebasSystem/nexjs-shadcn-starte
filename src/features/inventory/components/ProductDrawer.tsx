'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  Textarea,
} from 'src/shared/components/ui';

import type { CreateProductPayload, InventoryMasterItem } from '../types/inventory.types';

export type ProductDrawerMode = 'create' | 'edit';

interface ProductDrawerProps {
  open: boolean;
  mode: ProductDrawerMode;
  product?: InventoryMasterItem | null;
  categories: { uid: string; name: string }[];
  warehouses: { uid: string; name: string }[];
  onClose: () => void;
  onSave: (payload: CreateProductPayload) => Promise<void>;
}

export function ProductDrawer({
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
  const [description, setDescription] = useState(product?.description ?? '');
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
    setDescription(product?.description ?? '');
    setCategoryUid(product?.category_uid ?? '');
    setReorderPoint(String(product?.reorder_point ?? 0));
    setActive(product ? product.is_active : true);
    setWarehouseStocks(Object.fromEntries(warehouses.map((w) => [w.uid, '0'])));
    setErrors({});
  }, [open, product, warehouses]);

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
        description: description.trim() || undefined,
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
          <Textarea
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional del producto"
            className="min-h-[60px] resize-none"
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
                onClick={() => onSave({ name, sku, is_active: false }).then(() => onClose())}
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
