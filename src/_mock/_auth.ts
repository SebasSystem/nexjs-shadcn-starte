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
        subheader: 'Inventario Kardex',
        order: 2,
        items: [
          {
            id: '10',
            name: 'Productos',
            icon: 'products',
            path: '/dashboard/products',
            order: 1,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [],
          },
          {
            id: '20',
            name: 'Bodegas',
            icon: 'warehouse',
            path: '/dashboard/warehouses',
            order: 2,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [],
          },
          {
            id: '30',
            name: 'Movimientos',
            icon: 'movements',
            path: '/dashboard/movements',
            order: 3,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [],
          },
          {
            id: '40',
            name: 'Reservas B2B',
            icon: 'reservations',
            path: '/dashboard/reservations',
            order: 4,
            itemparentId: null,
            permissions: ['view', 'edit', 'create', 'delete'],
            moduleId: '2',
            children: [],
          },
          {
            id: '50',
            name: 'Reportes',
            icon: 'reports',
            path: '/dashboard/reports',
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
        subheader: 'Configuraciones',
        order: 3,
        items: [
          {
            id: '100',
            name: 'Ajustes App',
            icon: 'Settings',
            path: '/dashboard/settings',
            order: 1,
            itemparentId: null,
            permissions: ['view', 'edit'],
            moduleId: '3',
            children: [
              {
                id: '101',
                name: 'Mi Perfil',
                icon: '',
                path: '/dashboard/settings/profile',
                order: 1,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
              {
                id: '102',
                name: 'Seguridad',
                icon: '',
                path: '/dashboard/settings/security',
                order: 2,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
              {
                id: '103',
                name: 'Usuarios',
                icon: '',
                path: '/dashboard/settings/users',
                order: 3,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
              {
                id: '104',
                name: 'Roles y Permisos',
                icon: '',
                path: '/dashboard/settings/roles',
                order: 4,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
              {
                id: '105',
                name: 'Notificaciones',
                icon: '',
                path: '/dashboard/settings/notifications',
                order: 5,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
              {
                id: '106',
                name: 'Apariencia',
                icon: '',
                path: '/dashboard/settings/appearance',
                order: 6,
                itemparentId: '100',
                permissions: ['view', 'edit'],
                moduleId: '3',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  message: 'Logged-in user data successfully retrieved',
};
