// ─── Types ───────────────────────────────────────────────────────────────────

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'reserved';

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
  reserved: number;
  status: 'active' | 'inactive';
};

export type WarehouseMovement = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productSku: string;
  from: 'main' | 'store';
  to: 'main' | 'store';
  quantity: number;
  comment: string;
  registeredBy: string;
};

export type B2BReservation = {
  id: string;
  quoteNumber: string;
  client: string;
  productId: string;
  productName: string;
  reserved: number;
  approvedAt: string;
  status: 'approved' | 'in_process' | 'pending';
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
    reserved: 0,
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
    reserved: 2,
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
    reserved: 5,
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
    reserved: 10,
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
    reserved: 0,
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
    reserved: 8,
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
    reserved: 30,
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
    reserved: 4,
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
    reserved: 0,
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
    reserved: 12,
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
    reserved: 0,
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
    reserved: 2,
    status: 'active',
  },
];

// ─── Movements ────────────────────────────────────────────────────────────────

export const MOCK_MOVEMENTS: WarehouseMovement[] = [
  {
    id: 'mov-001',
    date: '2026-03-04T10:23:00Z',
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
    productId: 'prod-003',
    productName: 'Gorra Deportiva Negra',
    productSku: 'SKU-089-BK',
    from: 'main',
    to: 'store',
    quantity: 6,
    comment: '',
    registeredBy: 'Admin',
  },
];

// ─── B2B Reservations ─────────────────────────────────────────────────────────

export const MOCK_B2B_RESERVATIONS: B2BReservation[] = [
  {
    id: 'res-001',
    quoteNumber: 'COT-2024-0166',
    client: 'Distribuidora Mayorista',
    productId: 'prod-004',
    productName: 'Pantalón Cargo Verde M',
    reserved: 10,
    approvedAt: '2026-03-03T10:00:00Z',
    status: 'approved',
  },
  {
    id: 'res-002',
    quoteNumber: 'COT-2024-0165',
    client: 'Retail Corp',
    productId: 'prod-007',
    productName: 'Calcetines Deportivos Pack x3',
    reserved: 30,
    approvedAt: '2026-03-02T14:00:00Z',
    status: 'approved',
  },
  {
    id: 'res-003',
    quoteNumber: 'COT-2024-0164',
    client: 'Super Norte',
    productId: 'prod-010',
    productName: 'Camiseta Polo L',
    reserved: 12,
    approvedAt: '2026-03-01T09:00:00Z',
    status: 'in_process',
  },
  {
    id: 'res-004',
    quoteNumber: 'COT-2024-0163',
    client: 'Almacenes del Sur',
    productId: 'prod-006',
    productName: 'Auriculares BT Pro',
    reserved: 8,
    approvedAt: '2026-02-28T11:00:00Z',
    status: 'approved',
  },
  {
    id: 'res-005',
    quoteNumber: 'COT-2024-0162',
    client: 'Cadena Sport MX',
    productId: 'prod-002',
    productName: 'Zapatilla Running 42',
    reserved: 2,
    approvedAt: '2026-02-27T16:00:00Z',
    status: 'pending',
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function getProductStockStatus(product: Product): StockStatus {
  const total = product.stockMain + product.stockStore;
  const available = total - product.reserved;
  if (total === 0) return 'out_of_stock';
  if (available <= 0) return 'reserved';
  if (total <= product.minStock) return 'low_stock';
  return 'available';
}

export function getProductAvailable(product: Product): number {
  return product.stockMain + product.stockStore - product.reserved;
}
