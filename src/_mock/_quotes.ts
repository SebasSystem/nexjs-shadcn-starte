// ─── Types ────────────────────────────────────────────────────────────────────

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export type QuoteItem = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  warehouse: 'main' | 'store';
};

export type QuoteMock = {
  id: string;
  clientName: string;
  status: QuoteStatus;
  createdAt: string;
  items: QuoteItem[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_QUOTES: QuoteMock[] = [
  {
    id: 'COT-2026-001',
    clientName: 'Distribuidora Mayorista S.A.',
    status: 'approved',
    createdAt: '2026-03-10T10:00:00Z',
    items: [
      {
        productId: 'prod-004',
        productName: 'Pantalón Cargo Verde M',
        sku: 'SKU-012-M',
        quantity: 10,
        warehouse: 'main',
      },
      {
        productId: 'prod-007',
        productName: 'Calcetines Deportivos Pack x3',
        sku: 'SKU-055-P3',
        quantity: 30,
        warehouse: 'main',
      },
    ],
  },
  {
    id: 'COT-2026-002',
    clientName: 'Retail Corp Ltda.',
    status: 'approved',
    createdAt: '2026-03-11T14:00:00Z',
    items: [
      {
        productId: 'prod-006',
        productName: 'Auriculares BT Pro',
        sku: 'SKU-201-BT',
        quantity: 8,
        warehouse: 'main',
      },
      {
        productId: 'prod-010',
        productName: 'Camiseta Polo L',
        sku: 'SKU-002-L',
        quantity: 12,
        warehouse: 'main',
      },
      {
        productId: 'prod-002',
        productName: 'Zapatilla Running 42',
        sku: 'SKU-045-42',
        quantity: 2,
        warehouse: 'main',
      },
    ],
  },
  {
    id: 'COT-2026-003',
    clientName: 'Super Norte Colombia',
    status: 'sent',
    createdAt: '2026-03-12T09:00:00Z',
    items: [
      {
        productId: 'prod-008',
        productName: 'Mochila Trail 30L',
        sku: 'SKU-077-30',
        quantity: 5,
        warehouse: 'main',
      },
      {
        productId: 'prod-012',
        productName: 'Reloj GPS Sport',
        sku: 'SKU-300-GPS',
        quantity: 3,
        warehouse: 'main',
      },
    ],
  },
  {
    id: 'COT-2026-004',
    clientName: 'Almacenes del Sur',
    status: 'sent',
    createdAt: '2026-03-13T11:00:00Z',
    items: [
      {
        productId: 'prod-003',
        productName: 'Gorra Deportiva Negra',
        sku: 'SKU-089-BK',
        quantity: 20,
        warehouse: 'store',
      },
      {
        productId: 'prod-001',
        productName: 'Camiseta Básica XL',
        sku: 'SKU-001-XL',
        quantity: 15,
        warehouse: 'main',
      },
    ],
  },
  {
    id: 'COT-2026-005',
    clientName: 'Cadena Sport MX',
    status: 'draft',
    createdAt: '2026-03-15T16:30:00Z',
    items: [
      {
        productId: 'prod-004',
        productName: 'Pantalón Cargo Verde M',
        sku: 'SKU-012-M',
        quantity: 5,
        warehouse: 'main',
      },
      {
        productId: 'prod-006',
        productName: 'Auriculares BT Pro',
        sku: 'SKU-201-BT',
        quantity: 4,
        warehouse: 'main',
      },
    ],
  },
  {
    id: 'COT-2026-006',
    clientName: 'Grupo Textil Andino',
    status: 'rejected',
    createdAt: '2026-03-08T08:00:00Z',
    items: [
      {
        productId: 'prod-001',
        productName: 'Camiseta Básica XL',
        sku: 'SKU-001-XL',
        quantity: 50,
        warehouse: 'main',
      },
    ],
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

/**
 * Calcula cuántas unidades de un producto están reservadas por cotizaciones aprobadas.
 * Este es el valor "reservado" real — se deriva de los mocks, no se edita directamente.
 */
export function getReservedByProduct(productId: string): number {
  return MOCK_QUOTES.filter((q) => q.status === 'approved')
    .flatMap((q) => q.items)
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Devuelve todas las cotizaciones que contienen un producto específico.
 * Incluye aprobadas, enviadas y borradores para mostrar el pipeline completo.
 */
export function getQuotesByProduct(productId: string): QuoteMock[] {
  return MOCK_QUOTES.filter((q) => q.items.some((item) => item.productId === productId));
}

/**
 * Devuelve el label y color de un estado de cotización.
 */
export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'secondary' }
> = {
  approved: { label: 'Aprobada', color: 'success' },
  sent: { label: 'Enviada', color: 'info' },
  draft: { label: 'Borrador', color: 'secondary' },
  rejected: { label: 'Rechazada', color: 'error' },
};
