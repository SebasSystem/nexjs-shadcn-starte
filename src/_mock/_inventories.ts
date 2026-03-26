// ─── Types ───────────────────────────────────────────────────────────────────

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'reserved';

export type MovementType =
  | 'transfer'
  | 'receipt'
  | 'adjustment_add'
  | 'adjustment_sub'
  | 'reservation';

export type AdjustmentReason = 'physical_count' | 'damage' | 'loss' | 'entry_error' | 'other';

export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  minStock: number;
  stockMain: number;
  stockStore: number;
  status: 'active' | 'inactive';
};

export type WarehouseMovement = {
  id: string;
  date: string;
  type: MovementType;
  // Transfer fields
  productId?: string;
  productName?: string;
  productSku?: string;
  from?: 'main' | 'store' | 'external';
  to?: 'main' | 'store' | 'external';
  quantity?: number;
  comment: string;
  registeredBy: string;
  // Receipt fields
  receiptOrderRef?: string;
  receiptItems?: { productId: string; productName: string; productSku: string; quantity: number }[];
  // Adjustment fields
  adjustmentReason?: AdjustmentReason;
  adjustmentReasonOther?: string;
  adjustmentWarehouse?: 'main' | 'store';
  // Reservation fields
  quoteId?: string;
  clientName?: string;
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', name: 'Ropa' },
  { id: 'cat-2', name: 'Calzado' },
  { id: 'cat-3', name: 'Accesorios' },
  { id: 'cat-4', name: 'Deportes' },
  { id: 'cat-5', name: 'Electrónica' },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// NOTA: el campo `reserved` fue eliminado del modelo de producto.
// Ahora se calcula dinámicamente desde MOCK_QUOTES (cotizaciones aprobadas).
// Usar siempre getReservedForProduct(productId) y getProductAvailable(product).

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Camiseta Básica XL',
    sku: 'SKU-001-XL',
    category: 'Ropa',
    unit: 'Unidad',
    minStock: 25,
    stockMain: 2,
    stockStore: 1,
    status: 'active',
  },
  {
    id: 'prod-002',
    name: 'Zapatilla Running 42',
    sku: 'SKU-045-42',
    category: 'Calzado',
    unit: 'Par',
    minStock: 20,
    stockMain: 5,
    stockStore: 3,
    status: 'active',
  },
  {
    id: 'prod-003',
    name: 'Gorra Deportiva Negra',
    sku: 'SKU-089-BK',
    category: 'Accesorios',
    unit: 'Unidad',
    minStock: 30,
    stockMain: 10,
    stockStore: 2,
    status: 'active',
  },
  {
    id: 'prod-004',
    name: 'Pantalón Cargo Verde M',
    sku: 'SKU-012-M',
    category: 'Ropa',
    unit: 'Unidad',
    minStock: 15,
    stockMain: 40,
    stockStore: 18,
    status: 'active',
  },
  {
    id: 'prod-005',
    name: 'Chaqueta Impermeable S',
    sku: 'SKU-033-S',
    category: 'Ropa',
    unit: 'Unidad',
    minStock: 10,
    stockMain: 0,
    stockStore: 0,
    status: 'active',
  },
  {
    id: 'prod-006',
    name: 'Auriculares BT Pro',
    sku: 'SKU-201-BT',
    category: 'Electrónica',
    unit: 'Unidad',
    minStock: 8,
    stockMain: 22,
    stockStore: 10,
    status: 'active',
  },
  {
    id: 'prod-007',
    name: 'Calcetines Deportivos Pack x3',
    sku: 'SKU-055-P3',
    category: 'Ropa',
    unit: 'Pack',
    minStock: 50,
    stockMain: 120,
    stockStore: 60,
    status: 'active',
  },
  {
    id: 'prod-008',
    name: 'Mochila Trail 30L',
    sku: 'SKU-077-30',
    category: 'Deportes',
    unit: 'Unidad',
    minStock: 12,
    stockMain: 15,
    stockStore: 7,
    status: 'active',
  },
  {
    id: 'prod-009',
    name: 'Botella Térmica 750ml',
    sku: 'SKU-099-75',
    category: 'Deportes',
    unit: 'Unidad',
    minStock: 20,
    stockMain: 0,
    stockStore: 0,
    status: 'active',
  },
  {
    id: 'prod-010',
    name: 'Camiseta Polo L',
    sku: 'SKU-002-L',
    category: 'Ropa',
    unit: 'Unidad',
    minStock: 20,
    stockMain: 35,
    stockStore: 15,
    status: 'active',
  },
  {
    id: 'prod-011',
    name: 'Guantes Ciclismo M',
    sku: 'SKU-110-M',
    category: 'Deportes',
    unit: 'Par',
    minStock: 15,
    stockMain: 0,
    stockStore: 2,
    status: 'active',
  },
  {
    id: 'prod-012',
    name: 'Reloj GPS Sport',
    sku: 'SKU-300-GPS',
    category: 'Electrónica',
    unit: 'Unidad',
    minStock: 5,
    stockMain: 8,
    stockStore: 3,
    status: 'active',
  },
];

// ─── Movements ────────────────────────────────────────────────────────────────

export const MOCK_MOVEMENTS: WarehouseMovement[] = [
  {
    id: 'mov-001',
    date: '2026-03-04T10:23:00Z',
    type: 'transfer',
    productId: 'prod-004',
    productName: 'Pantalón Cargo Verde M',
    productSku: 'SKU-012-M',
    from: 'main',
    to: 'store',
    quantity: 10,
    comment: 'Reposición semanal tienda',
    registeredBy: 'Admin',
  },
  {
    id: 'mov-002',
    date: '2026-03-04T09:10:00Z',
    type: 'transfer',
    productId: 'prod-006',
    productName: 'Auriculares BT Pro',
    productSku: 'SKU-201-BT',
    from: 'main',
    to: 'store',
    quantity: 5,
    comment: 'Traslado para exhibición',
    registeredBy: 'Admin',
  },
  {
    id: 'mov-003',
    date: '2026-03-03T16:45:00Z',
    type: 'transfer',
    productId: 'prod-007',
    productName: 'Calcetines Deportivos Pack x3',
    productSku: 'SKU-055-P3',
    from: 'store',
    to: 'main',
    quantity: 20,
    comment: 'Excedente de tienda',
    registeredBy: 'Colaborador',
  },
  {
    id: 'mov-004',
    date: '2026-03-03T14:00:00Z',
    type: 'transfer',
    productId: 'prod-010',
    productName: 'Camiseta Polo L',
    productSku: 'SKU-002-L',
    from: 'main',
    to: 'store',
    quantity: 8,
    comment: '',
    registeredBy: 'Admin',
  },
  {
    id: 'mov-005',
    date: '2026-03-02T11:30:00Z',
    type: 'transfer',
    productId: 'prod-008',
    productName: 'Mochila Trail 30L',
    productSku: 'SKU-077-30',
    from: 'main',
    to: 'store',
    quantity: 3,
    comment: 'Pedido especial cliente',
    registeredBy: 'Admin',
  },
  {
    id: 'mov-006',
    date: '2026-03-01T09:00:00Z',
    type: 'transfer',
    productId: 'prod-012',
    productName: 'Reloj GPS Sport',
    productSku: 'SKU-300-GPS',
    from: 'store',
    to: 'main',
    quantity: 2,
    comment: 'Devolución tienda',
    registeredBy: 'Colaborador',
  },
  {
    id: 'mov-007',
    date: '2026-02-28T15:20:00Z',
    type: 'transfer',
    productId: 'prod-002',
    productName: 'Zapatilla Running 42',
    productSku: 'SKU-045-42',
    from: 'main',
    to: 'store',
    quantity: 4,
    comment: 'Reposición',
    registeredBy: 'Admin',
  },
  {
    id: 'mov-008',
    date: '2026-02-27T13:00:00Z',
    type: 'transfer',
    productId: 'prod-003',
    productName: 'Gorra Deportiva Negra',
    productSku: 'SKU-089-BK',
    from: 'main',
    to: 'store',
    quantity: 6,
    comment: '',
    registeredBy: 'Admin',
  },
  // ─── Receipts (entradas de mercancía) ─────────────────────────────────────
  {
    id: 'mov-009',
    date: '2026-03-10T08:30:00Z',
    type: 'receipt',
    from: 'external',
    to: 'main',
    comment: '',
    registeredBy: 'Admin',
    receiptOrderRef: 'OC-2026-042',
    receiptItems: [
      {
        productId: 'prod-005',
        productName: 'Chaqueta Impermeable S',
        productSku: 'SKU-033-S',
        quantity: 25,
      },
      {
        productId: 'prod-009',
        productName: 'Botella Térmica 750ml',
        productSku: 'SKU-099-75',
        quantity: 30,
      },
    ],
  },
  // ─── Adjustments (ajustes manuales) ───────────────────────────────────────
  {
    id: 'mov-010',
    date: '2026-03-08T14:00:00Z',
    type: 'adjustment_sub',
    productId: 'prod-001',
    productName: 'Camiseta Básica XL',
    productSku: 'SKU-001-XL',
    from: 'main',
    quantity: 3,
    comment: 'Unidades dañadas en traslado',
    registeredBy: 'Admin',
    adjustmentReason: 'damage',
    adjustmentWarehouse: 'main',
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

/**
 * Calcula el stock reservado de un producto a partir de las cotizaciones aprobadas.
 * IMPORTANTE: importar MOCK_QUOTES desde _quotes para no crear dependencia circular.
 * Esta function es la fuente de verdad para "reservado".
 */
export function getReservedForProduct(
  productId: string,
  approvedQuotes: { items: { productId: string; quantity: number }[] }[]
): number {
  return approvedQuotes
    .flatMap((q) => q.items)
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getProductStockStatus(product: Product, reserved: number): StockStatus {
  const total = product.stockMain + product.stockStore;
  const available = total - reserved;
  if (total === 0) return 'out_of_stock';
  if (available <= 0) return 'reserved';
  if (total <= product.minStock) return 'low_stock';
  return 'available';
}

export function getProductAvailable(product: Product, reserved: number): number {
  return product.stockMain + product.stockStore - reserved;
}

// ─── Movement type config ─────────────────────────────────────────────────────

export const MOVEMENT_TYPE_CONFIG: Record<
  MovementType,
  { label: string; color: 'info' | 'success' | 'warning' | 'error' | 'secondary' }
> = {
  transfer: { label: 'Traslado', color: 'info' },
  receipt: { label: 'Entrada de mercancía', color: 'success' },
  adjustment_add: { label: 'Ajuste positivo', color: 'success' },
  adjustment_sub: { label: 'Ajuste negativo', color: 'warning' },
  reservation: { label: 'Reserva B2B', color: 'secondary' },
};

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  physical_count: 'Conteo físico',
  damage: 'Merma / daño',
  loss: 'Pérdida / robo',
  entry_error: 'Error de registro',
  other: 'Otro',
};
