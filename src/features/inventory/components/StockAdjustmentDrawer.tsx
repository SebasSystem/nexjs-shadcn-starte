'use client';

import { useState, useEffect } from 'react';
import {
  Icon,
  Button,
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
import { Input } from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { useInventory, type RichProduct } from '../hooks/useInventory';
import { ADJUSTMENT_REASON_LABELS, type AdjustmentReason } from 'src/_mock/_inventories';
import { toast } from 'sonner';

interface StockAdjustmentDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Si viene de una fila, el producto ya está preseleccionado */
  preselectedProduct?: RichProduct | null;
}

export function StockAdjustmentDrawer({
  open,
  onClose,
  preselectedProduct,
}: StockAdjustmentDrawerProps) {
  const { products, adjustStock } = useInventory();

  const [productId, setProductId] = useState(preselectedProduct?.id ?? '');
  const [warehouse, setWarehouse] = useState<'main' | 'store'>('main');
  const [type, setType] = useState<'add' | 'sub'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<AdjustmentReason | ''>('');
  const [reasonOther, setReasonOther] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (preselectedProduct) setProductId(preselectedProduct.id);
  }, [preselectedProduct]);

  const selectedProduct = products.find((p) => p.id === productId);
  const currentInWarehouse = selectedProduct
    ? warehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockStore
    : 0;
  const qty = Number(quantity) || 0;
  const newStock = type === 'add' ? currentInWarehouse + qty : currentInWarehouse - qty;
  const wouldGoNegative = type === 'sub' && qty > currentInWarehouse;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!productId) newErrors.product = 'Selecciona un producto';
    if (!quantity || qty < 1) newErrors.quantity = 'Ingresa una cantidad válida (mínimo 1)';
    else if (wouldGoNegative)
      newErrors.quantity = `No puedes reducir más unidades de las que existen en esta bodega (disponible: ${currentInWarehouse})`;
    if (!reason) newErrors.reason = 'Selecciona un motivo';
    if (reason === 'other' && !reasonOther.trim()) newErrors.reasonOther = 'Describe el motivo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    adjustStock({
      productId,
      warehouse,
      type,
      quantity: qty,
      reason: reason as AdjustmentReason,
      reasonOther: reason === 'other' ? reasonOther : undefined,
      notes,
      registeredBy: 'Admin',
    });
    setLoading(false);
    toast.success(`Ajuste ${type === 'add' ? 'positivo' : 'negativo'} registrado correctamente`);
    handleClose();
  };

  const handleClose = () => {
    if (!preselectedProduct) setProductId('');
    setWarehouse('main');
    setType('add');
    setQuantity('');
    setReason('');
    setReasonOther('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Ajuste de inventario</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Producto */}
          <div className="space-y-1.5">
            <Label>Producto *</Label>
            {preselectedProduct ? (
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 flex items-center gap-3">
                <Icon name="Package" size={16} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-subtitle2 text-foreground font-medium">
                    {preselectedProduct.name}
                  </p>
                  <p className="text-caption text-muted-foreground font-mono">
                    {preselectedProduct.sku}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className={cn(errors.product && 'border-error')}>
                    <SelectValue placeholder="Seleccionar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.status === 'active')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {p.sku}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.product && <p className="text-caption text-error">{errors.product}</p>}
              </>
            )}
          </div>

          {/* Bodega */}
          <div className="space-y-1.5">
            <Label>Bodega a ajustar *</Label>
            <Select value={warehouse} onValueChange={(v) => setWarehouse(v as 'main' | 'store')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Bodega Principal</SelectItem>
                <SelectItem value="store">Tienda</SelectItem>
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-caption text-muted-foreground">
                Stock actual en {warehouse === 'main' ? 'B. Principal' : 'Tienda'}:{' '}
                <span className="font-semibold text-foreground">{currentInWarehouse} uds</span>
              </p>
            )}
          </div>

          {/* Tipo de ajuste */}
          <div className="space-y-2">
            <Label>Tipo de ajuste *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType('add')}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all text-left',
                  type === 'add'
                    ? 'border-success bg-success/5 text-success'
                    : 'border-border/60 text-muted-foreground hover:border-success/40'
                )}
              >
                <Icon name="Plus" size={18} />
                <div>
                  <p className="text-subtitle2 font-semibold">Aumentar</p>
                  <p className="text-caption">Añadir unidades</p>
                </div>
              </button>
              <button
                onClick={() => setType('sub')}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all text-left',
                  type === 'sub'
                    ? 'border-warning bg-warning/5 text-warning'
                    : 'border-border/60 text-muted-foreground hover:border-warning/40'
                )}
              >
                <Icon name="Minus" size={18} />
                <div>
                  <p className="text-subtitle2 font-semibold">Reducir</p>
                  <p className="text-caption">Descontar unidades</p>
                </div>
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-qty">Cantidad a ajustar *</Label>
            <Input
              id="adj-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.quantity;
                  return n;
                });
              }}
              className={cn(errors.quantity && 'border-error')}
            />
            {errors.quantity && <p className="text-caption text-error">{errors.quantity}</p>}

            {/* Preview */}
            {selectedProduct && qty > 0 && !wouldGoNegative && (
              <div
                className={cn(
                  'rounded-lg px-3 py-2.5 mt-1 border',
                  type === 'add'
                    ? 'bg-success/5 border-success/20'
                    : 'bg-warning/5 border-warning/20'
                )}
              >
                <p className="text-caption text-muted-foreground">
                  Stock actual:{' '}
                  <span className="font-semibold text-foreground">{currentInWarehouse}</span> →
                  Nuevo stock:{' '}
                  <span
                    className={cn('font-bold', type === 'add' ? 'text-success' : 'text-warning')}
                  >
                    {newStock}
                  </span>{' '}
                  uds
                </p>
              </div>
            )}
          </div>

          {/* Motivo (obligatorio) */}
          <div className="space-y-1.5">
            <Label>Motivo del ajuste *</Label>
            <Select
              value={reason}
              onValueChange={(v) => {
                setReason(v as AdjustmentReason);
                setErrors((p) => {
                  const n = { ...p };
                  delete n.reason;
                  return n;
                });
              }}
            >
              <SelectTrigger className={cn(errors.reason && 'border-error')}>
                <SelectValue placeholder="Seleccionar motivo..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ADJUSTMENT_REASON_LABELS) as AdjustmentReason[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ADJUSTMENT_REASON_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && <p className="text-caption text-error">{errors.reason}</p>}

            {reason === 'other' && (
              <div className="space-y-1.5 mt-2">
                <Label htmlFor="reason-other">Describe el motivo *</Label>
                <Input
                  id="reason-other"
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                  placeholder="Ej: Conteo inicial de apertura..."
                  className={cn(errors.reasonOther && 'border-error')}
                />
                {errors.reasonOther && (
                  <p className="text-caption text-error">{errors.reasonOther}</p>
                )}
              </div>
            )}
          </div>

          {/* Notas adicionales */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="adj-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observaciones del ajuste..."
            />
          </div>

          {/* Resumen */}
          {selectedProduct && qty > 0 && reason && (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-caption text-muted-foreground">
                Ajuste de{' '}
                <span className={cn('font-bold', type === 'add' ? 'text-success' : 'text-warning')}>
                  {type === 'add' ? '+' : '-'}
                  {qty} uds
                </span>{' '}
                en {warehouse === 'main' ? 'Bodega Principal' : 'Tienda'} por{' '}
                <span className="text-foreground font-medium">
                  {ADJUSTMENT_REASON_LABELS[reason as AdjustmentReason]}
                </span>
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar ajuste'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
