'use client';

import { useState } from 'react';
import {
  Icon,
  Button,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SelectField,
} from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { useInventory } from '../hooks/useInventory';
import { type QuoteMock, QUOTE_STATUS_CONFIG } from 'src/_mock/_quotes';
import { toast } from 'sonner';

interface ReserveStockDrawerProps {
  open: boolean;
  quote: QuoteMock | null;
  onClose: () => void;
}

export function ReserveStockDrawer({ open, quote, onClose }: ReserveStockDrawerProps) {
  const { products, approveQuote } = useInventory();
  const [warehouseOverrides, setWarehouseOverrides] = useState<Record<string, 'main' | 'store'>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  if (!quote) return null;

  const getWarehouseForItem = (productId: string, defaultWarehouse: 'main' | 'store') =>
    warehouseOverrides[productId] ?? defaultWarehouse;

  const itemsWithStatus = quote.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const selectedWarehouse = getWarehouseForItem(item.productId, item.warehouse);
    const stockInWarehouse = product
      ? selectedWarehouse === 'main'
        ? product.stockMain
        : product.stockStore
      : 0;
    const afterReserve = stockInWarehouse - item.quantity;
    const minStock = product?.minStock ?? 0;

    let status: 'ok' | 'low' | 'insufficient' = 'ok';
    if (afterReserve < 0) status = 'insufficient';
    else if (afterReserve < minStock) status = 'low';

    return { item, product, stockInWarehouse, afterReserve, status, selectedWarehouse };
  });

  const okCount = itemsWithStatus.filter((i) => i.status !== 'insufficient').length;
  const insufficientCount = itemsWithStatus.filter((i) => i.status === 'insufficient').length;
  const isPartial = insufficientCount > 0 && okCount > 0;
  const allInsufficient = insufficientCount === itemsWithStatus.length;
  const statusConfig = QUOTE_STATUS_CONFIG[quote.status];

  const handleConfirm = async () => {
    if (allInsufficient) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    approveQuote(quote.id, 'Admin');
    setLoading(false);
    toast.success(
      isPartial
        ? `Reserva parcial registrada — ${okCount} de ${itemsWithStatus.length} productos`
        : `Cotización ${quote.id} aprobada y stock reservado`
    );
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        {/* Header */}
        <SheetHeader className="border-b border-border/60 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Reservar stock para cotización</SheetTitle>
              <p className="text-caption text-muted-foreground mt-1">{quote.clientName}</p>
            </div>
            <Badge variant="soft" color={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-subtitle2 text-primary font-mono">{quote.id}</p>
        </SheetHeader>

        {/* Tabla de productos */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {itemsWithStatus.map(
            ({ item, product, stockInWarehouse, afterReserve, status, selectedWarehouse }) => {
              const statusIcon =
                status === 'ok' ? (
                  <Icon name="CheckCircle" size={15} className="text-success" />
                ) : status === 'low' ? (
                  <Icon name="AlertTriangle" size={15} className="text-warning" />
                ) : (
                  <Icon name="XCircle" size={15} className="text-error" />
                );

              const rowBg =
                status === 'insufficient'
                  ? 'bg-error/5 border-error/20'
                  : status === 'low'
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-muted/10 border-border/40';

              return (
                <div key={item.productId} className={cn('rounded-xl border p-3 space-y-2', rowBg)}>
                  {/* Producto */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-subtitle2 text-foreground font-medium truncate">
                        {item.productName}
                      </p>
                      <p className="text-caption text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">{statusIcon}</div>
                  </div>

                  {/* Columnas de datos */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Bodega */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Bodega
                      </p>
                      <SelectField
                        options={[
                          { value: 'main', label: `B. Principal (${product?.stockMain ?? 0})` },
                          { value: 'store', label: `Tienda (${product?.stockStore ?? 0})` },
                        ]}
                        value={selectedWarehouse}
                        onChange={(v) =>
                          setWarehouseOverrides((prev) => ({
                            ...prev,
                            [item.productId]: v as 'main' | 'store',
                          }))
                        }
                      />
                    </div>

                    {/* Solicitado */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Solicitado
                      </p>
                      <p className="text-subtitle2 font-bold text-foreground">
                        {item.quantity} uds
                      </p>
                    </div>

                    {/* Disponible actual */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Disponible
                      </p>
                      <p
                        className={cn(
                          'text-subtitle2 font-bold',
                          stockInWarehouse < item.quantity ? 'text-error' : 'text-foreground'
                        )}
                      >
                        {stockInWarehouse} uds
                      </p>
                    </div>
                  </div>

                  {/* Resultado */}
                  <div
                    className={cn(
                      'text-caption px-2 py-1 rounded-md',
                      status === 'ok' && 'text-success',
                      status === 'low' && 'text-warning',
                      status === 'insufficient' && 'text-error'
                    )}
                  >
                    {status === 'insufficient' ? (
                      <>⚠ Sin stock suficiente — faltan {Math.abs(afterReserve)} uds</>
                    ) : (
                      <>
                        Quedarán <span className="font-semibold">{afterReserve} uds</span>{' '}
                        disponibles tras reservar
                      </>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Resumen fijo */}
        <div className="border-t border-border/60 px-4 py-3 space-y-2">
          <p className="text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{okCount}</span> de{' '}
            <span className="font-semibold text-foreground">{itemsWithStatus.length}</span>{' '}
            productos tienen stock suficiente
          </p>
          {insufficientCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
              <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5 shrink-0" />
              <p className="text-caption text-warning">
                {insufficientCount} producto(s) sin stock no quedarán reservados hasta que ingreses
                mercancía.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border/60 pt-3 px-4 pb-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleConfirm} disabled={loading || allInsufficient}>
            {loading ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" />
                Confirmando...
              </>
            ) : isPartial ? (
              'Confirmar reserva parcial'
            ) : (
              'Confirmar reserva'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
