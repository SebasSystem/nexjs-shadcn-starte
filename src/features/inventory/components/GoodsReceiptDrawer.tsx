'use client';

import { useState } from 'react';
import {
  Icon,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SelectField,
  Textarea,
} from 'src/shared/components/ui';
import { Input } from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { useInventory } from '../hooks/useInventory';
import { toast } from 'sonner';

interface ReceiptItem {
  productId: string;
  quantity: number;
}

interface GoodsReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function GoodsReceiptDrawer({ open, onClose }: GoodsReceiptDrawerProps) {
  const { products, receiveGoods } = useInventory();

  const [warehouse, setWarehouse] = useState<'main' | 'store'>('main');
  const [orderRef, setOrderRef] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([{ productId: '', quantity: 1 }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const activeProducts = products.filter((p) => p.status === 'active');

  const addItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`item-${index}-${field}`];
      delete next[`item-${index}-dup`];
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const seenProducts = new Set<string>();

    items.forEach((item, i) => {
      if (!item.productId) {
        newErrors[`item-${i}-productId`] = 'Selecciona un producto';
      } else if (seenProducts.has(item.productId)) {
        newErrors[`item-${i}-dup`] =
          'Este producto ya está en la lista. Ajusta la cantidad directamente.';
      } else {
        seenProducts.add(item.productId);
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item-${i}-quantity`] = 'Mínimo 1 unidad';
      }
    });

    if (items.length === 0) newErrors.items = 'Agrega al menos un producto';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    receiveGoods({
      warehouse,
      orderRef,
      notes,
      registeredBy: 'Admin',
      items: items
        .filter((i) => i.productId)
        .map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
    });
    setLoading(false);
    toast.success('Entrada registrada correctamente');
    handleClose();
  };

  const handleClose = () => {
    setWarehouse('main');
    setOrderRef('');
    setNotes('');
    setItems([{ productId: '', quantity: 1 }]);
    setErrors({});
    onClose();
  };

  const totalItems = items.filter((i) => i.productId).length;
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Registrar entrada de mercancía</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Campos de cabecera */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Bodega de destino *"
              required
              className="col-span-2"
              options={[
                { value: 'main', label: 'Bodega Principal' },
                { value: 'store', label: 'Tienda' },
              ]}
              value={warehouse}
              onChange={(v) => setWarehouse(v as 'main' | 'store')}
            />

            <Input
              label="Nº orden de compra"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="Ej: OC-2026-045"
            />

            <Input
              label="Observaciones"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional..."
            />
          </div>

          {/* Lista de productos */}
          <div>
            <p className="text-subtitle2 font-semibold text-foreground mb-3">Productos recibidos</p>
            {errors.items && <p className="text-caption text-error mb-2">{errors.items}</p>}

            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedProduct = products.find((p) => p.id === item.productId);
                const currentInWarehouse = selectedProduct
                  ? warehouse === 'main'
                    ? selectedProduct.stockMain
                    : selectedProduct.stockStore
                  : null;
                const newStock =
                  currentInWarehouse !== null
                    ? currentInWarehouse + (Number(item.quantity) || 0)
                    : null;

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      {/* Selector de producto */}
                      <div className="flex-1 space-y-1">
                        <SelectField
                          options={activeProducts.map((p) => ({
                            value: p.id,
                            label: `${p.name} — ${p.sku}`,
                          }))}
                          value={item.productId}
                          onChange={(v) => updateItem(index, 'productId', v as string)}
                          placeholder="Seleccionar producto..."
                          error={
                            errors[`item-${index}-dup`] || errors[`item-${index}-productId`]
                          }
                        />
                        {selectedProduct && (
                          <p className="text-caption text-muted-foreground">
                            {selectedProduct.sku} · {selectedProduct.unit} · Stock actual:{' '}
                            <span className="text-foreground font-medium">
                              {currentInWarehouse} uds
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Cantidad */}
                      <div className="w-24 space-y-1">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className={cn(errors[`item-${index}-quantity`] && 'border-error')}
                          placeholder="Cant."
                        />
                        {errors[`item-${index}-quantity`] && (
                          <p className="text-caption text-error">
                            {errors[`item-${index}-quantity`]}
                          </p>
                        )}
                      </div>

                      {/* Eliminar */}
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="mt-1 text-muted-foreground hover:text-error transition-colors p-1"
                        >
                          <Icon name="Trash2" size={15} />
                        </button>
                      )}
                    </div>

                    {/* Preview de stock */}
                    {newStock !== null && item.quantity >= 1 && (
                      <div className="flex items-center gap-2 text-caption text-muted-foreground">
                        <Icon name="ArrowRight" size={12} className="text-success" />
                        <span>
                          Nuevo stock en {warehouse === 'main' ? 'B. Principal' : 'Tienda'}:{' '}
                          <span className="font-semibold text-success">{newStock} uds</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-1.5 text-caption text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Icon name="Plus" size={14} />
              Agregar otro producto
            </button>
          </div>

          {/* Notas finales */}
          {notes === '' && (
            <Textarea
              label="Notas adicionales (opcional)"
              rows={2}
              placeholder="Observaciones generales de la recepción..."
            />
          )}
        </div>

        {/* Footer fijo con resumen */}
        <div className="border-t border-border/60 px-4 pt-3 pb-1">
          <p className="text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{totalItems} producto(s)</span> ·{' '}
            <span className="font-semibold text-foreground">{totalUnits} unidades totales</span> →{' '}
            {warehouse === 'main' ? 'Bodega Principal' : 'Tienda'}
          </p>
        </div>

        <SheetFooter className="border-t border-border/60 pt-3 px-4 pb-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Icon name="PackagePlus" size={15} />
                Confirmar entrada
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
