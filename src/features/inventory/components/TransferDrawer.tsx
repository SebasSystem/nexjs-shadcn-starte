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
import { useInventory } from '../hooks/useInventory';

interface TransferDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TransferDrawer({ open, onClose }: TransferDrawerProps) {
  const { products, transferStock } = useInventory();

  const [productId, setProductId] = useState('');
  const [from, setFrom] = useState<'main' | 'store'>('main');
  const [quantity, setQuantity] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
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

  const handleSave = async () => {
    if (!validate() || !selectedProduct) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    transferStock({
      productId,
      from,
      to,
      quantity: qty,
      comment,
      registeredBy: 'Admin',
    });
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setProductId('');
    setFrom('main');
    setQuantity('');
    setComment('');
    setErrors({});
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
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
              'Confirmar traslado'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
