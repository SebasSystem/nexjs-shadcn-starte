// ─────────────────────────────────────────────────────────────────────────────
// Mock: Respuesta del endpoint POST /auth/login
// Tokens válidos hasta 2030 (exp: 1893456000 ≈ 2030-01-01)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_LOGIN_RESPONSE = {
  // payload: { sub, type:"access", iat:1740787200, exp:1893456000 }
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc0MDc4NzIwMCwiZXhwIjoxODkzNDU2MDAwfQ.mockAccessSignature123456789',
  // payload: { sub, type:"refresh", iat:1740787200, exp:1893456000, jti }
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NDA3ODcyMDAsImV4cCI6MTg5MzQ1NjAwMCwianRpIjoiYjQ1NzYzZTAtYTFlYS00NDg3LTk2ZTItY2JhODkwMTIzNDU2In0.mockRefreshSignature123456789',
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock: Respuesta del endpoint GET /auth/init-data
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_INIT_DATA_RESPONSE = {
  statusCode: 200,
  data: {
    id: '1',
    names: 'Juan Díaz',
    email: 'juan.diaz@empresa.com',
    roles: [{ id: '1', name: 'admin' }],
    modules: [
      {
        moduleId: '1',
        subheader: 'General',
        order: 1,
        items: [
          {
            id: '1',
            name: 'Dashboard',
            icon: 'dashboard',
            path: '/dashboard',
            order: 1,
            itemparentId: null,
            permissions: ['view'],
            moduleId: '1',
            children: [],
          },
        ],
      },
      {
        moduleId: '2',
        subheader: 'Inventario',
        order: 2,
        items: [
          {
            id: '20',
            name: 'Productos',
            icon: 'products',
            path: '/inventory/products',
            order: 2,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [],
          },
          {
            id: '30',
            name: 'Bodegas',
            icon: 'warehouse',
            path: '/inventory/warehouses',
            order: 3,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [
              {
                id: '31',
                name: 'Vista General',
                icon: 'overview',
                path: '/inventory/warehouses',
                order: 1,
                itemparentId: '30',
                permissions: ['view'],
                moduleId: '2',
                children: [],
              },
              {
                id: '32',
                name: 'Movimientos',
                icon: 'movements',
                path: '/inventory/warehouses/movements',
                order: 2,
                itemparentId: '30',
                permissions: ['view', 'edit', 'create'],
                moduleId: '2',
                children: [],
              },
            ],
          },
          {
            id: '40',
            name: 'Stock & Disponibilidad',
            icon: 'stock',
            path: '/inventory/stock',
            order: 4,
            itemparentId: null,
            permissions: ['view'],
            moduleId: '2',
            children: [],
          },
          {
            id: '50',
            name: 'Reportes',
            icon: 'reports',
            path: '/inventory/reports',
            order: 5,
            itemparentId: null,
            permissions: ['view'],
            moduleId: '2',
            children: [],
          },
        ],
      },
      {
        moduleId: '3',
        subheader: 'Ventas',
        order: 3,
        items: [
          {
            id: '60',
            name: 'Pipeline',
            icon: 'sales',
            path: '/sales/pipeline',
            order: 1,
            itemparentId: null,
            permissions: ['view'],
            moduleId: '3',
            children: [],
          },
          {
            id: '61',
            name: 'Dashboard Financiero',
            icon: 'reports',
            path: '/sales/finance',
            order: 2,
            itemparentId: null,
            permissions: ['view'],
            moduleId: '3',
            children: [],
          },
          {
            id: '62',
            name: 'Cotizador CPQ',
            icon: 'pricelist',
            path: '/sales/finance/quotation',
            order: 3,
            itemparentId: null,
            permissions: ['view', 'edit', 'create'],
            moduleId: '3',
            children: [],
          },
          {
            id: '63',
            name: 'Reglas de Crédito',
            icon: 'b2b',
            path: '/sales/finance/credit-rules',
            order: 4,
            itemparentId: null,
            permissions: ['view', 'edit'],
            moduleId: '3',
            children: [],
          },
          {
            id: '64',
            name: 'Multimoneda',
            icon: 'Settings',
            path: '/sales/finance/multi-currency',
            order: 5,
            itemparentId: null,
            permissions: ['view', 'edit'],
            moduleId: '3',
            children: [],
          },
        ],
      },
    ],
  },
  message: 'Logged-in user data successfully retrieved',
};
