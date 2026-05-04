import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  getProductAvailable,
  getProductStockStatus,
  MOCK_MOVEMENTS,
  MOCK_PRODUCTS,
  type Product,
  type StockStatus,
} from 'src/_mock/_inventories';
import {
  getQuotesByProduct,
  MOCK_QUOTES,
  QUOTE_STATUS_CONFIG,
  type QuoteMock,
} from 'src/_mock/_quotes';

export type RichProduct = Product & {
  reserved: number;
  available: number;
  physical: number;
  stockStatus: StockStatus;
  relatedQuotes: QuoteMock[];
};

export function useInventory() {
  const products = MOCK_PRODUCTS;
  const movements = MOCK_MOVEMENTS;
  const quotes = MOCK_QUOTES;

  const richProducts: RichProduct[] = useMemo(() => {
    const getReserved = (productId: string) => {
      return quotes
        .filter((q) => q.status === 'approved')
        .flatMap((q) => q.items)
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
    };

    return products.map((p) => {
      const reserved = getReserved(p.id);
      const available = getProductAvailable(p, reserved);
      const physical = p.stockMain + p.stockStore;
      const stockStatus = getProductStockStatus(p, reserved);
      const relatedQuotes = getQuotesByProduct(p.id).filter(
        (q) => q.status === 'approved' || q.status === 'sent'
      );
      return { ...p, reserved, available, physical, stockStatus, relatedQuotes };
    });
  }, [products, quotes]);

  const stats = useMemo(() => {
    const totalPhysical = richProducts.reduce((sum, p) => sum + p.physical, 0);
    const totalReserved = richProducts.reduce((sum, p) => sum + p.reserved, 0);
    const totalAvailable = richProducts.reduce((sum, p) => sum + p.available, 0);
    const outOfStock = richProducts.filter((p) => p.stockStatus === 'out_of_stock').length;
    const lowStock = richProducts.filter((p) => p.stockStatus === 'low_stock').length;
    const activeQuotes = quotes.filter(
      (q) => q.status === 'approved' || q.status === 'sent'
    ).length;
    const approvedQuotes = quotes.filter((q) => q.status === 'approved').length;
    const criticalProducts = richProducts.filter((p) => p.available <= 0).length;
    return {
      totalPhysical,
      totalReserved,
      totalAvailable,
      outOfStock,
      lowStock,
      activeQuotes,
      approvedQuotes,
      criticalProducts,
      totalProducts: richProducts.length,
      activeProducts: richProducts.filter((p) => p.status === 'active').length,
    };
  }, [richProducts, quotes]);

  const warehouseStats = useMemo(() => {
    const totalMain = products.reduce((sum, p) => sum + p.stockMain, 0);
    const totalStore = products.reduce((sum, p) => sum + p.stockStore, 0);
    const skusMain = products.filter((p) => p.stockMain > 0).length;
    const skusStore = products.filter((p) => p.stockStore > 0).length;
    return { totalMain, totalStore, skusMain, skusStore };
  }, [products]);

  const movementStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const thisMonth = movements.filter((m) => new Date(m.date).getMonth() === currentMonth);
    const transfers = thisMonth.filter((m) => m.type === 'transfer');
    const receipts = thisMonth.filter((m) => m.type === 'receipt');
    const adjustments = thisMonth.filter(
      (m) => m.type === 'adjustment_add' || m.type === 'adjustment_sub'
    );
    const mainToStore = transfers.filter((m) => m.from === 'main' && m.to === 'store').length;
    const storeToMain = transfers.filter((m) => m.from === 'store' && m.to === 'main').length;
    const totalUnits = transfers.reduce((sum, m) => sum + (m.quantity ?? 0), 0);
    const totalReceived = receipts.reduce((sum, m) => sum + (m.quantity ?? 0), 0);
    return {
      totalThisMonth: thisMonth.length,
      transfers: transfers.length,
      receipts: receipts.length,
      adjustments: adjustments.length,
      mainToStore,
      storeToMain,
      totalUnits,
      totalReceived,
    };
  }, [movements]);

  // Mock estático: las acciones muestran un mensaje pero no mutan nada.
  // Esto mantiene limpios los componentes hasta que haya servicio real.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const transferStock = (...args: any[]) => {
    toast.success('Traslado simulado correctamente (modo estático)');
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const receiveGoods = (...args: any[]) => {
    toast.success('Entrada simulada correctamente (modo estático)');
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const adjustStock = (...args: any[]) => {
    toast.success('Ajuste simulado correctamente (modo estático)');
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const approveQuote = (...args: any[]) => {
    toast.success('Cotización reserva aprobada (modo estático)');
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const createProduct = (...args: any[]) => {
    toast.success('Producto guardado (modo estático)');
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const updateProduct = (...args: any[]) => {
    toast.success('Producto actualizado (modo estático)');
  };

  return {
    products: richProducts,
    movements,
    quotes,
    stats,
    warehouseStats,
    movementStats,
    QUOTE_STATUS_CONFIG,
    transferStock,
    receiveGoods,
    adjustStock,
    approveQuote,
    createProduct,
    updateProduct,
  };
}
